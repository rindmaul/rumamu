-- ============================================================================
-- rumamu - 0007_create_order_sale_price.sql
-- Recreate create_order so checkout charges the promo price when one is active
-- (sale_price set, positive, and below the regular price). Only the price
-- lookup changed vs 0002; everything else (locking, stock, items) is identical.
-- ============================================================================
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
  v_sale numeric;
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

    select price, sale_price, stock, name, is_active
      into v_price, v_sale, v_stock, v_name, v_active
      from public.products
      where id = v_product_id
      for update;

    if not found or v_active is not true then
      raise exception 'Produk tidak tersedia.';
    end if;

    if v_stock < v_qty then
      raise exception 'Stok % tidak mencukupi (tersisa %).', v_name, v_stock;
    end if;

    -- Honor an active promo price; ignore null / non-positive / not-lower values.
    if v_sale is not null and v_sale > 0 and v_sale < v_price then
      v_price := v_sale;
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
