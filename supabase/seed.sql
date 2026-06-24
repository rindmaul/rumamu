-- ============================================================================
-- rumamu - seed.sql
-- Initial catalog: 4 categories + 9 products. Mirrors src/data/products.ts.
-- Safe to re-run: upserts on slug / name.
-- ============================================================================

insert into public.categories (name, slug) values
  ('Seating', 'seating'),
  ('Tables', 'tables'),
  ('Storage', 'storage'),
  ('Lighting', 'lighting')
on conflict (slug) do nothing;

insert into public.products
  (name, subtitle, slug, category_id, price, stock, dimensions, description, image_url, status, is_active, is_featured)
values
  (
    'Rattan Round Storage', 'Meja Samping Bulat', 'rattan-round-storage',
    (select id from public.categories where slug = 'storage'),
    899000, 8, 'Diameter 50 cm, Tinggi 55 cm',
    'Material rotan alami pilihan, rangka kokoh, desain multifungsi sebagai meja samping sekaligus penyimpanan, warna natural, cocok untuk ruang tamu, kamar tidur, dan area santai. Handmade dengan sentuhan artisan.',
    '/products/image1.png', 'Tersedia', true, true
  ),
  (
    'Rattan Sofa Chair', 'Kursi Santai Rendah', 'rattan-sofa-chair',
    (select id from public.categories where slug = 'seating'),
    1799000, 6, 'Lebar 75-80 cm x Kedalaman 70 cm x Tinggi 75 cm',
    'Material rotan alami berkualitas, rangka kuat dan stabil, desain ergonomis untuk kenyamanan duduk, finishing natural, cocok untuk ruang tamu, teras, kafe, maupun area santai indoor dan outdoor beratap.',
    '/products/image2.png', 'Tersedia', true, true
  ),
  (
    'Rattan Storage', 'Nakas / Nightstand', 'rattan-storage-nightstand',
    (select id from public.categories where slug = 'storage'),
    1299000, 10, 'Panjang 50 cm x Lebar 40 cm x Tinggi 60 cm',
    'Material rotan alami dan rangka kokoh, dilengkapi ruang penyimpanan praktis, desain minimalis modern, warna natural, cocok digunakan sebagai nakas kamar tidur atau meja samping sofa.',
    '/products/image3.png', 'Tersedia', true, true
  ),
  (
    'Rattan Coffee Table', 'Round', 'rattan-coffee-table-round',
    (select id from public.categories where slug = 'tables'),
    1499000, 7, 'Diameter 60-80 cm, Tinggi 40-45 cm',
    'Material rotan alami premium, bentuk bulat elegan, konstruksi kuat dan ringan, desain estetik untuk ruang tamu, ruang keluarga, maupun area komersial seperti kafe dan hotel.',
    '/products/image4.png', 'Tersedia', true, true
  ),
  (
    'Rattan Console Table', null, 'rattan-console-table',
    (select id from public.categories where slug = 'tables'),
    2299000, 5, 'Panjang 120-140 cm x Lebar 35-40 cm x Tinggi 75-80 cm',
    'Material rotan alami dengan rangka kokoh, desain ramping dan modern, cocok untuk area foyer, lorong, ruang tamu, maupun dekorasi komersial. Finishing natural yang mudah dipadukan dengan berbagai konsep interior.',
    '/products/image5.png', 'Tersedia', true, false
  ),
  (
    'Rattan Table Lamp', null, 'rattan-table-lamp',
    (select id from public.categories where slug = 'lighting'),
    499000, 12, 'Tinggi total 40-50 cm, Diameter kap 25-30 cm',
    'Material rotan anyam berkualitas, desain dekoratif dan estetik, menghasilkan pencahayaan hangat dan nyaman, cocok untuk kamar tidur, ruang tamu, kafe, maupun hotel.',
    '/products/image6.png', 'Tersedia', true, true
  ),
  (
    'Rattan Display Shelf', null, 'rattan-display-shelf',
    (select id from public.categories where slug = 'storage'),
    2499000, 4, 'Lebar 40-50 cm x Kedalaman 30-35 cm x Tinggi 150-170 cm',
    'Material rotan alami dengan struktur kuat, beberapa tingkat rak penyimpanan, desain minimalis dan fungsional, cocok untuk display dekorasi, tanaman hias, buku, maupun kebutuhan retail.',
    '/products/image7.png', 'Tersedia', true, false
  ),
  (
    'Rattan Coffee Table', 'Oval / Modern', 'rattan-coffee-table-oval-modern',
    (select id from public.categories where slug = 'tables'),
    2199000, 6, 'Panjang 90-100 cm x Lebar 50-60 cm x Tinggi 45 cm',
    'Material rotan premium, desain oval modern dan elegan, konstruksi kokoh, permukaan luas untuk kebutuhan ruang tamu, cocok dipadukan dengan berbagai gaya interior seperti Japandi, Bohemian, dan Scandinavian.',
    '/products/image8.png', 'Tersedia', true, true
  ),
  (
    'Rattan Armchair', null, 'rattan-armchair',
    (select id from public.categories where slug = 'seating'),
    1899000, 7, 'Lebar 65-70 cm x Kedalaman 65 cm x Tinggi 85-90 cm',
    'Material rotan alami pilihan, sandaran tangan ergonomis, rangka kuat dan nyaman digunakan, desain elegan dan timeless, cocok untuk ruang tamu, teras, lounge, maupun area komersial.',
    '/products/image9.png', 'Tersedia', true, false
  )
on conflict (slug) do nothing;
