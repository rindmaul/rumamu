-- ============================================================================
-- rumamu - 0002_order_rpcs.sql
-- Customer-facing order RPCs. All run SECURITY DEFINER so anonymous shoppers
-- can create + read + confirm their own order without direct table access.
-- ============================================================================

-- ---------------------------------------------------------------------------
-- create_order: validates, locks product rows, decrements stock atomically.
--
-- Concurrency: each product row is locked with SELECT ... FOR UPDATE during
-- validation, so two simultaneous checkouts for the same product are
-- serialized and stock can never go negative. The whole body is one short
-- transaction with no external calls (lock-short-transactions best practice).
-- ---------------------------------------------------------------------------
create or replace function public.create_order(
  p_customer_name text,
  p_customer_phone text,
  p_customer_email text,
  p_shipping_address text,
  p_city text,
  p_postal_code text,
  p_order_note text,
  p_shipping_method text,
  p_shipping_fee numeric,
  p_payment_method text,
  p_items jsonb
)
returns text
language plpgsql
security definer
set search_path = ''
as $$
declare
  v_item jsonb;
  v_product_id uuid;
  v_qty integer;
  v_price numeric;
  v_stock integer;
  v_name text;
  v_active boolean;
  v_line numeric;
  v_subtotal numeric := 0;
  v_lines jsonb := '[]'::jsonb;
  v_order_id uuid;
  v_order_number text;
begin
  if p_items is null or jsonb_array_length(p_items) = 0 then
    raise exception 'Keranjang kosong.';
  end if;

  -- Pass 1: validate quantities, lock rows, compute totals.
  for v_item in select * from jsonb_array_elements(p_items)
  loop
    v_product_id := (v_item ->> 'product_id')::uuid;
    v_qty := (v_item ->> 'quantity')::integer;

    if v_qty is null or v_qty <= 0 then
      raise exception 'Jumlah produk tidak valid.';
    end if;

    select price, stock, name, is_active
      into v_price, v_stock, v_name, v_active
      from public.products
      where id = v_product_id
      for update;

    if not found or v_active is not true then
      raise exception 'Produk tidak tersedia.';
    end if;

    if v_stock < v_qty then
      raise exception 'Stok % tidak mencukupi (tersisa %).', v_name, v_stock;
    end if;

    v_line := v_price * v_qty;
    v_subtotal := v_subtotal + v_line;
    v_lines := v_lines || jsonb_build_object(
      'product_id', v_product_id,
      'product_name', v_name,
      'product_price', v_price,
      'quantity', v_qty,
      'subtotal', v_line
    );
  end loop;

  v_order_number :=
    'RUM-2026-' || lpad(nextval('public.order_number_seq')::text, 6, '0');

  insert into public.orders (
    order_number, customer_name, customer_phone, customer_email,
    shipping_address, city, postal_code, order_note,
    shipping_method, shipping_fee, payment_method,
    payment_status, order_status, subtotal, total
  ) values (
    v_order_number, p_customer_name, p_customer_phone, p_customer_email,
    p_shipping_address, p_city, p_postal_code, p_order_note,
    p_shipping_method, coalesce(p_shipping_fee, 0), p_payment_method,
    'Menunggu Pembayaran (Simulasi)', 'Menunggu Konfirmasi Simulasi',
    v_subtotal, v_subtotal + coalesce(p_shipping_fee, 0)
  )
  returning id into v_order_id;

  -- Pass 2: write line items + decrement stock (rows already locked above).
  for v_item in select * from jsonb_array_elements(v_lines)
  loop
    insert into public.order_items (
      order_id, product_id, product_name, product_price, quantity, subtotal
    ) values (
      v_order_id,
      (v_item ->> 'product_id')::uuid,
      v_item ->> 'product_name',
      (v_item ->> 'product_price')::numeric,
      (v_item ->> 'quantity')::integer,
      (v_item ->> 'subtotal')::numeric
    );

    update public.products
      set stock = stock - (v_item ->> 'quantity')::integer,
          status = case
            when stock - (v_item ->> 'quantity')::integer <= 0 then 'Habis'
            else status
          end,
          updated_at = now()
      where id = (v_item ->> 'product_id')::uuid;
  end loop;

  return v_order_number;
end;
$$;

grant execute on function public.create_order(
  text, text, text, text, text, text, text, text, numeric, text, jsonb
) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- get_order_with_items: fetch a single order (plus its items) by number.
-- Lets an anonymous shopper view their receipt without exposing the table.
-- Returns null when the order number is unknown.
-- ---------------------------------------------------------------------------
create or replace function public.get_order_with_items(p_order_number text)
returns jsonb
language sql
security definer
set search_path = ''
stable
as $$
  select to_jsonb(o) || jsonb_build_object(
    'items',
    coalesce(
      (
        select jsonb_agg(to_jsonb(oi) order by oi.created_at)
        from public.order_items oi
        where oi.order_id = o.id
      ),
      '[]'::jsonb
    )
  )
  from public.orders o
  where o.order_number = p_order_number;
$$;

grant execute on function public.get_order_with_items(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- confirm_order_payment: marks a simulated payment confirmed.
-- ---------------------------------------------------------------------------
create or replace function public.confirm_order_payment(p_order_number text)
returns void
language plpgsql
security definer
set search_path = ''
as $$
begin
  update public.orders
    set payment_status = 'Pembayaran Dikonfirmasi (Simulasi)',
        order_status = 'Pembayaran Dikonfirmasi (Simulasi)',
        updated_at = now()
    where order_number = p_order_number;
end;
$$;

grant execute on function public.confirm_order_payment(text) to anon, authenticated;
