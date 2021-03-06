let index = 0; // 0 english 1 indonesia 2 other

module.exports.setLanguage = function(lang){
  const ref = ['english','indonesia','thai'];
  const newIndex = ref.indexOf(lang);
  if(newIndex > -1) index = newIndex;

  console.warn(index);
}

const dict = {};

dict['CATCH'] = ['TANGKAPAN','จับ'];
dict['LOAN'] = ['PINJAMAN','เงินกู้'];
dict['DELIVERY'] = ['KIRIMAN','การจัดส่งสินค้า'];
dict['REPORT'] = ['LAPORAN','รายงาน'];
dict['Change language: '] = ['Ganti bahasa: '];
dict['Language'] = ['Bahasa'];
dict['TEST MULTIPLE LANGUAGE'] = ['TES MULTI BAHASA'];

dict['Home'] = ['Beranda','หน้าแรก'];
dict['Edit Profile'] = ['Edit Profil','แก้ไขโปรไฟล์'];
dict['Register Supplier'] = ['Daftar Supplier','ลงทะเบียนซัพพลายเออร์'];
dict['Register Buyer'] = ['Daftar Pembeli','ลงทะเบียนผู้ซื้อ'];
dict['Register Fishermen'] = ['Daftar Nelayan','ลงทะเบียนชาวประมง'];
dict['Register Fishing Vessel'] = ['Daftar Kapal Ikan','ลงทะเบียนเรือประมง'];
dict['Register Fish'] = ['Daftar Ikan','ลงทะเบียนปลา'];
dict['Change PIN'] = ['Ganti PIN','เปลี่ยนรหัสผ่าน'];
dict['CHANGE PIN'] = ['GANTI PIN','เปลี่ยนรหัสผ่าน'];
dict['Help'] = ['Bantuan','ตัวเลือกความช่วยเหลือ'];
dict['HELP'] = ['BANTUAN','ตัวเลือกความช่วยเหลือ'];
dict['LOGOUT'] = ['Keluar'];

dict['INVALID PIN'] = ['PIN TIDAK COCOK'];
dict['SYNCHRONIZING'] = ['SINKRONISASI'];
dict['SYNCHRONIZING FAILED'] = ['SINKRONISASI TERKENDALA'];
dict['Registration'] = ['Pendaftaran'];
dict['Phone Number'] = ['Nomor telepon'];
dict['Phone number'] = ['Nomor telepon'];
dict['THANK YOU FOR YOUR REGISTRATION'] = ['TERIMA KASIH ATAS PENDAFTARAN ANDA'];
dict['OUR TEAM WILL REVIEW YOUR REGISTRATION FOR APPROVAL'] = ['TIM KAMI AKAN MENINJAU PENDAFTARAN ANDA UNTUK PERSETUJUAN'];
dict['Please enter your name'] = ['Masukkan nama anda'];
dict['Please enter your phone number'] = ['Masukkan nomor telepon anda'];
dict['Can not register user. Please retry later.'] = ['Pendaftaran mengalami kendala, cobalah beberapa saat lagi.'];
dict['Please enter current PIN'] = ['Masukkan PIN (6 digit angka) yang sekarang'];
dict['Please reenter your PIN (6 digits) again'] = ['Masukkan PIN (6 digit angka) anda kembali'];
dict['Can not change PIN. Please try again later.'] = ['Perubahan PIN mengalami kendala, cobalah beberapa saat lagi.'];
dict['PIN CHANGED SUCCESSFULLY'] = ['PIN BERHASIL DIUBAH'];
dict['NO INTERNET CONNECTION'] = ['TIDAK ADA KONEKSI INTERNET'];
dict['Enter current PIN'] = ['Masukkan PIN (6 digit angka) yang sekarang'];
dict['Enter new PIN'] = ['Masukkan PIN (6 digit angka) baru'];
dict['Retype new PIN'] = ['Masukkan lagi PIN (6 digit angka) baru'];

dict['SCAN QR CODE ON TRAFIZ APP'] = ['PINDAI KODE QR DI APL TRAFIZ'];
dict['Scan QR Code'] = ['Pindai Kode QR'];
dict['QR Code'] = ['Kode QR'];
dict['Add Catch'] = ['Tambah Tangkapan'];
dict['Add'] = ['Tambah'];
dict['Zoom Out'] = ['Perkecil'];
dict['Get coordinate'] = ['Ambil Koordinat'];
dict['TAP AREA TO ZOOM IN'] = ['KETUK AREA UNTUK PERBESAR'];
dict['TAP FISHING LOCATION'] = ['KETUK LOKASI PENANGKAPAN IKAN'];
dict['latitude:'] = ['lintang:'];
dict['longitude:'] = ['bujur:'];
dict['Finish'] = ['Selesai'];
dict['Detail'] = ['Rincian'];
dict['Remove'] = ['Hapus'];
dict['Delete'] = ['Hapus'];
dict['Edit'] = ['Sunting'];
dict['Save'] = ['Simpan'];
dict['Retry'] = ['Coba lagi'];
dict['Buy Fish'] = ['Beli Ikan'];
dict['Calc Fish'] = ['Hitung Ikan'];
dict['Send All'] = ['Kirim Semua'];
dict['Send Selected'] = ['Kirim Pilihan'];
dict['Send'] = ['Kirim'];
dict['History'] = ['Riwayat'];
dict['PRINT'] = ['CETAK'];
dict['Send SMS'] = ['Kirim SMS'];
dict['Show List'] = ['Tampilkan Daftar'];
dict['Confirm Close'] = ['Konfirmasikan Tutup'];
dict['SET DELIVERY INFORMATION'] = ['ATUR INFORMASI PENGIRIMAN'];
dict['DELIVERY SHEET'] = ['LEMBAR PENGIRIMAN'];
dict['Set Sell Price'] = ['Setel Harga Jual'];
dict['Close Transaction'] = ['Tutup Transaksi'];
dict['Sell price:'] = ['Harga jual:'];
dict['Notes:'] = ['Catatan:'];
dict['Closed'] = ['Tutup'];
dict['ON CLOSED TRANSACTION, DELIVERY INFORMATION CAN NOT BE EDITED AGAIN.'] = ['PADA TRANSAKSI YANG TERTUTUP, INFORMASI PENGIRIMAN TIDAK DAPAT DIPERBARUI LAGI.'];
dict['CONFIRM CLOSE TO RETRIEVE DELIVERY SHEET'] = ['KONFIRMASIKAN TUTUP UNTUK MENDAPATKAN LEMBAR PENGIRIMAN'];
dict['Please set price first.'] = ['Silakan tetapkan harga terlebih dahulu.'];
dict['Please close transaction first.'] = ['Harap tutup transaksi terlebih dahulu.'];
dict['Enter amount..'] = ['Masukkan jumlah..'];

dict['CAN NOT UPLOAD PHOTO, PLEASE RETRY LATER.'] = ['UNGGAHAN FOTO MENGALAMI KENDALA, COBALAH BEBERAPA SAAT LAGI.'];
dict['Permission to use camera'] = ['Ijin untuk menggunakan kamera'];
dict['We need your permission to use your camera phone'] = ['Kami membutuhkan ijin anda untuk menggunakan kamera'];
dict['Snap'] = ['Jepret'];

dict['Price per kg'] = ['Harga per kg'];
dict['Buy price'] = ['Harga beli'];
dict['Other expense'] = ['Biaya lainnya'];
dict['Net buy price:'] = ['Harga beli bersih:'];

dict['TAP TO SET'] = ['KETUK UTK SET'];
dict['NOT SET'] = ['TIDAK DIATUR'];
dict[' not set'] = [' tidak diatur'];
dict['TAKE PICTURE'] = ['AMBIL GAMBAR'];
dict['fisherman photo'] = ['foto nelayan'];
dict['(mandatory)'] = ['(wajib)'];
dict['Weight'] = ['Berat'];
dict['Grade'] = ['Mutu'];

dict['Write notes..'] = ['Tulis catatan..'];
dict['NOTES'] = ['CATATAN'];
dict['Search by name..'] = ['Cari berdasarkan nama..'];

dict['NEW FISH'] = ['IKAN BARU'];
dict['FISH'] = ['IKAN'];
dict['EDIT FISH'] = ['SUNTING IKAN'];
dict['ADD CATCH'] = ['TAMBAH TANGKAPAN'];
dict['EDIT CATCH'] = ['SUNTING TANGKAPAN'];
dict['ADD BUYER'] = ['TAMBAH PEMBELI'];
dict['EDIT BUYER'] = ['SUNTING PEMBELI'];
dict['ADD FISHERMAN'] = ['TAMBAH NELAYAN'];
dict['EDIT FISHERMAN'] = ['SUNTING NELAYAN'];
dict['ADD FISHING VESSEL'] = ['TAMBAH KAPAL IKAN'];
dict['EDIT FISHING VESSEL'] = ['SUNTING KAPAL IKAN'];
dict['FISHING VESSEL'] = ['KAPAL IKAN'];
dict['ADD SUPPLIER'] = ['TAMBAH SUPPLIER'];
dict['EDIT SUPPLIER'] = ['SUNTING SUPPLIER'];
dict['Search Fish'] = ['Cari Ikan'];
dict['SEARCH FISH'] = ['CARI IKAN'];
dict['SET FISH'] = ['ATUR IKAN'];
dict['Enter fish name to search (min. 3 chars)'] = ['Masukkan nama ikan untuk mencari (min. 3 huruf)'];

dict['DELIVERED TO'] = ['DIKIRIM KEPADA'];
dict['FOR'] = ['KEPADA'];
dict['FISHERMAN'] = ['NELAYAN'];
dict['SUPPLIER'] = ['SUPPLIER'];
dict['BUYER'] = ['PEMBELI'];

dict['item(s)'] = ['barang'];
dict['estimated'] = ['perkiraan'];
dict['Pay Loan'] = ['Pembayaran Pinjaman'];
dict['Add Loan'] = ['Tambah Pinjaman'];
dict['Pay loan amount'] = ['Jumlah pembayaran pinjaman'];
dict['Loans'] = ['Pinjaman'];
dict['Strike Items'] = ['Coret Barang'];
dict['New item name'] = ['Nama barang baru'];
dict['Unit definition'] = ['Definisi unit'];
dict['One unit price'] = ['Harga per unit'];
dict['New Borrower'] = ["Peminjam Baru"];
dict['SET ITEM'] = ['ATUR BARANG'];
dict['UNIT'] = ['UNIT'];
dict['Estimated price'] = ['Perkiraan harga'];
dict['Next Loan'] = ['Pinjaman Berikutnya'];
dict['Unit amount'] = ['Jumlah unit'];
dict['Estimated loan value:'] = ['Perkiraan nilai pinjaman:'];
dict['Item kind:'] = ['Jenis barang:'];
dict['SET DATE'] = ['ATUR TANGGAL'];
dict['Loan Payment Input'] = ['Masukan Pembayaran Pinjaman'];
dict['Loan payment'] = ['Pembayaran pinjaman'];
dict['Loan date:'] = ['Tanggal peminjaman:'];
dict['Loan amount'] = ['Besar pinjaman'];
dict['Set loan date first'] = ['Atur tanggal pinjaman terlebih dahulu'];
dict['Set item first'] = ['Atur barang terlebih dahulu'];
dict['Estimated price / unit must be filled'] = ['Perkiraan harga per unit harus diisi'];
dict['Unit amount must be filled'] = ['Jumlah unit harus diisi'];
dict['Loan amount must be filled'] = ['Besar pinjaman harus diisi'];
dict['Not allowed'] = ['Tidak diijinkan'];
dict['Others'] = ['Lainnya'];
dict['Oil'] = ['Minyak'];
dict['GALLONS'] = ['JERIGEN'];
dict['Ice'] = ['Es'];
dict['BLOCKS'] = ['BALOK'];
dict['Cigarette'] = ['Rokok'];
dict['BOXES'] = ['KOTAK']
dict['Food'] = ['Makanan'];
dict['PORTIONS'] = ['PORSI'];
dict['Money'] = ['Uang'];
dict['DOLLAR'] = ['RUPIAH'];

dict['TRANSACTIONS'] = ['TRANSAKSI'];
dict['NO LOAN ON THIS DATE'] = ['TIDAK ADA PINJAMAN DI TANGGAL INI'];
dict['NO PAY LOAN ON THIS DATE'] = ['TIDAK ADA PEMBAYARAN PINJAMAN DI TANGGAL INI'];
dict['NO DELIVERY/SALE ON THIS DATE'] = ['TIDAK ADA PENGIRIMAN/PENJUALAN DI TANGGAL INI'];

dict['DELIVERED'] = ['SUDAH DIKIRIM'];

dict['CHANGE'] = ['UBAH'];
dict['BOUGHT:'] = ['BELI:'];
dict['SOLD:'] = ['JUAL:'];
dict['PROFIT:'] = ['KEUNTUNGAN:'];
dict['Bought:'] = ['Beli:'];
dict['Sold:'] = ['Jual:'];
dict['Profit:'] = ['Keuntungan:'];
dict['LOAN:'] = ['PINJAMAN:'];
dict['Loan:'] = ['Pinjaman:'];
dict['Lend:'] = ['Pinjaman:'];
dict['PAID:'] = ['PEMBAYARAN:'];
dict['Paid:'] = ['Pembayaran:'];
dict['PAY LOAN:'] = ['PEMBAYARAN:'];
dict['Pay loan:'] = ['Pembayaran:'];
dict['BALANCE:'] = ['SALDO:'];
dict['Balance:'] = ['Saldo:'];
dict['Filter by borrower:'] = ['Tampilkan peminjam:'];
dict['All'] = ['Semua'];

dict['Enter your Phone Number'] = ['Masukkan Nomor HP'];
dict['Enter your PIN'] = ['Masukkan PIN (6 digit angka) anda'];
dict['Retype your PIN'] = ['Masukkan lagi PIN (6 digit angka) anda'];
dict['Enter PHONE / SUPPLIER ID'] = ['Masukkan NO. TELEPON / NO. SUPPLIER'];
dict['Login'] = ['Masuk'];
dict['Name'] = ['Nama'];
dict['National ID'] = ['No. KTP'];
dict['Email'] = ['Surel'];
dict['Supplier ID (from government)'] = ['No. Supplier'];
dict['Sign in'] = ['Masuk'];
dict['Register'] = ['Daftar'];
dict['Vessel Unique ID:'] = ['No. Kapal:'];
dict['Date of departure:'] = ['Tanggal Keberangkatan:']; 
dict['Important'] = ['Penting'];
dict['PAUSE SCREEN'] = ['Layar Jeda'];
dict['UNDER CONSTRUCTION'] = ['MASIH DALAM PENGEMBANGAN']; 
dict['Synchronize'] = ['Sinkronisasi'];

dict['ID'] = ['KTP'];
dict['Sex'] = ['Jenis Kelamin'];
dict['Male'] = ['Pria'];
dict['Female'] = ['Wanita'];
dict['Nationality'] = ['Kenegaraan'];
dict['Indonesia'] = ['Indonesia']; 
dict['Singapore'] = ['Singapura'];
dict['United States'] = ['Amerika Serikat'];
dict['Philipine'] = ['Filipina'];
dict['Date of birth'] = ['Tanggal Lahir'];
dict['Address'] = ['Alamat'];
dict['Phone'] = ['No. Telp'];
dict['Job / Title'] = ['Jabatan'];
dict['Captain'] = ['Kapten'];
dict['Crew'] = ['ABK'];
dict['Helper'] = ['Asisten'];
dict['Fisher'] = ['Nelayan'];

dict['Indonesian Name'] = ['Nama Indonesia'];
dict['English Name'] = ['Nama Inggris'];
dict['ASFIS Code'] = ['Kode ASFIS'];                  
dict['Photo'] = ['Foto'];
dict['Local Name'] = ['Nama Lokal'];
dict['Est. Price'] = ['Perkiraan Harga'];

dict['Buyer name'] = ['Nama pembeli'];
dict['Buyer ID'] = ['KTP pembeli'];
dict['Buyer personal ID card'] = ['No. KTP pembeli'];
dict['Buyer sex'] = ['Jenis kelamin pembeli'];
dict['Buyer company name'] = ['Nama perusahaan pembeli'];
dict['Buyer business license'] = ['Ijin usaha (SIUP) pembeli'];
dict['Buyer contact person'] = ['Nama kontak pembeli'];
dict['Buyer phone number'] = ['No. telp pembeli'];
dict['Buyer address'] = ['Alamat pembeli'];
dict['Country'] = ['Negara'];
dict['Province'] = ['Propinsi'];
dict['City'] = ['Kota'];
dict['District'] = ['Kecamatan'];

dict['Transport by'] = ['Transport Kirim'];
dict['Land'] = ['Darat'];
dict['Air'] = ['Udara'];
dict['Ship'] = ['Kapal'];
dict['Transport name/id'] = ['Nama Transport / Plat Nomor'];
dict['Transport receipt'] = ['Bukti Pengiriman'];
dict['Delivery date'] = ['Tanggal Pengiriman'];

dict['Vessel name'] = ['Nama Kapal'];
dict['Vessel Name'] = ['Nama Kapal'];
dict['Vessel license number'] = ['Surat Ijin Kapal'];
dict['Vessel license expire date'] = ['Tanggal Berakhir Ijin Kapal'];
dict['Fishing license number'] = ['Surat Ijin Menangkap'];
dict['Fishing license expire date'] = ['Tanggal Ijin Menangkap Berakhir'];
dict['Vessel size (GT)'] = ['Besar Kapal (GT)'];
dict['Vessel flag'] = ['Bendera Kapal'];
dict['Vessel gear type'] = ['Alat Pancing'];
dict['Vessel made date'] = ['Tanggal Pembuatan Kapal'];
dict['Vessel owner name'] = ['Nama Pemilik Kapal'];
dict['Vessel owner id'] = ['KTP Pemilik'];
dict['Vessel owner personal ID card'] = ['No. KTP Pemilik'];
dict['Vessel owner phone'] = ['No. Telp Pemilik'];
dict['Vessel owner sex'] = ['Jenis Kelamin'];
dict['Vessel owner DOB'] = ['Tanggal Lahir'];
dict['Vessel owner address'] = ['Alamat'];

dict['Buyer name'] = ['Nama pembeli'];
dict['Buyer ID'] = ['KTP pembeli'];
dict['Buyer personal ID card'] = ['No. KTP pembeli'];
dict['Buyer sex'] = ['Jenis kelamin pembeli'];
dict['Buyer company name'] = ['Nama perusahaan pembeli'];
dict['Buyer business license'] = ['Ijin usaha (SIUP) pembeli'];
dict['Buyer contact person'] = ['Nama kontak pembeli'];
dict['Buyer phone number'] = ['No. telp pembeli'];
dict['Buyer address'] = ['Alamat pembeli'];

dict['Supplier name'] = ['Nama supplier'];
dict['Supplier ID'] = ['KTP supplier'];
dict['Supplier personal ID card'] = ['No. KTP supplier'];
dict['Supplier sex'] = ['Jenis kelamin supplier'];
dict['Supplier company name'] = ['Nama perusahaan supplier'];
dict['Supplier business license'] = ['Ijin usaha (SIUP) supplier'];
dict['Supplier national code'] = ['Kode Supplier Nasional'];
dict['Company/Organization Name'] = ['Nama Perusahaan/Organisasi'];
dict['Supplier contact person'] = ['Nama kontak supplier'];
dict['Supplier phone number'] = ['No. telp supplier'];
dict['Supplier address'] = ['Alamat supplier'];

dict['Delivery sheet no'] = ['No. Lembar Pengiriman'];
dict['National registration supplier code'] = ['Kode Supplier Nasional'];
dict['Species'] = ['Spesies'];
dict['Number of fish/loin'] = ['Jumlah ikan/loin'];
dict['Total weight'] = ['Total berat'];
dict['Vessel registration no'] = ['Surat Ijin Kapal'];
dict['Expired date'] = ['Tanggal Berakhir Ijin Kapal'];
dict['Fishing ground'] = ['Area Menangkap'];
dict['Landing site'] = ['Tempat Pendaratan'];
dict['Gear type'] = ['Alat Pancing'];
dict['Catch date'] = ['Tanggal Penangkapan'];

dict['Fish Name'] = ['Nama Ikan'];
dict['Purchase Date'] = ['Tanggal Pembelian'];
dict['Purchase Time'] = ['Waktu Pembelian'];
dict['Catch or Farmed'] = ['Ditangkap atau budidaya'];
dict['Catch'] = ['Ditangkap'];
dict['Farmed'] = ['Budidaya'];
dict['Wild Catch'] = ['Ditangkap'];
dict['Aqua Culture'] = ['Budidaya'];
dict['By Catch'] = ['Apakah tangkapan lainnya?'];
dict['Yes'] = ['Ya'];
dict['No'] = ['Tidak'];
dict['FAD Use'] = ['Menggunakan Rumpon?'];
dict['Purchase Unique Number'] = ['Kode Transaksi'];
dict['Product Form At Landing'] = ['Bentuk Produk Ketika Mendarat'];
dict['Loin'] = ['Loin'];
dict['Whole'] = ['Ikan Utuh'];
dict['Unit Measurement'] = ['Unit Pengukuran'];
dict['Whole '] = ['Ekor'];
dict['Individual'] = ['Per Ekor'];
dict['Basket'] = ['Keranjang'];
dict['Quantity'] = ['Jumlah'];
dict['Weight'] = ['Berat (kg)'];
dict['Fishing Ground/Area'] = ['Area Tangkapan'];
dict['Purchase Location'] = ['Tempat Pembelian'];
dict['Unique Trip Id of Vessel'] = ['Nomor Unik Penangkapan'];
dict['Date of Vessel Departure'] = ['Tanggal Kapal Berangkat'];
dict['Date of Vessel Return'] = ['Tanggal Kapal Mendarat'];
dict['Port Name'] = ['Nama Pelabuhan'];
dict['Port Name/Landing Site'] = ['Nama Pelabuhan/Tempat Pendaratan Ikan'];

dict['This will take time. Synchronize now?'] = ['Sinkronisasi akan berlangsung lama. Lanjutkan?'];
dict['Not set'] = ['Belum diset'];
dict['individual(s)'] = ['ekor'];
dict['basket(s)'] = ['keranjang'];
dict['Current notes:'] = ['Catatan saat ini:'];
dict['Change Language'] = ['Ganti Bahasa','เปลี่ยนภาษา'];
dict['CHANGE LANGUAGE'] = ['GANTI BAHASA'];
dict['You have unsaved data. Synch now to prevent data loss. Continue resetting app will lose the unsaved data.'] = ['Anda memiliki data yang belum tersimpan ke server. Sinkronisasi sekarang untuk menyimpan data. Reset app akan menyebabkan data ini hilang.']
dict['Warning'] = ['Peringatan'];
dict['Continue'] = ['Lanjut'];
dict['Cancel'] = ['Batal'];
dict['Resetting this app will log you out and clear all of your cache. Only the unsaved data will be lost. The saved data is safe in our server. You will need internet connection to login again.'] = ['Reset app akan menghapus semua data lokal yang belum terkirim ke server. Data sebelumnya masih dan selalu aman di server kami. Anda akan membutuhkan jaringan internet untuk masuk kembali ke dalam aplikasi.'];
dict['Business License'] = ['Ijin Usaha (SIUP)'];
dict['Business license'] = ['Ijin usaha (SIUP)'];
dict['Supplier National Code'] = ['Kode Supplier Nasional'];
dict['BUY PRICE NOT SET'] = ['HARGA BELI BELUM DISET']
dict['SELL PRICE NOT SET'] = ['HARGA JUAL BELUM DISET']
dict['OPEN'] = ['TERBUKA'];
dict['CLOSED'] = ['DITUTUP'];
dict['Add Delivery'] = ['Tambah Pengiriman'];
dict['Delivery Sheet'] = ['Lembar Pengiriman'];
dict['Fish List'] = ['Daftar Ikan'];
dict['Grade Summary'] = ['Ringkasan Grade'];
dict['total weight'] = ['total berat'];
dict['Price'] = ['Harga'];
dict['Next'] = ['Lanjut'];
dict['SEND ERROR LOGS BY EMAIL'] = ['KIRIM LOG ERROR LEWAT EMAIL'];
dict['Duplicate'] = ['Gandakan'];
dict['(mandatory/6 digit)'] = ['(wajib/6 digit)'];
dict['Estimated total buy price'] = ['Estimasi total harga beli'];
dict['Notes'] = ['Catatan'];
dict['Expense:'] = ['Pengeluaran'];
dict['Income:'] = ['Pemasukan'];
dict['EXPENSE:'] = ['PENGELUARAN:'];
dict['INCOME:'] = ['PEMASUKAN:'];
dict['EXPENSE'] = ['PENGELUARAN'];
dict['INCOME'] = ['PEMASUKAN'];
dict['+Fish'] = ['+Ikan'];
dict['+FISH'] = ['+IKAN'];
dict['Duplicate/+Other Fish'] = ['Gandakan/+Ikan Lain'];
dict['NO FISH BOUGHT ON THIS DATE'] = ['TIDAK ADA PEMBELIAN IKAN DI TANGGAL INI'];
dict['Supplier ID expire date'] = ['Tanggal berakhir supplier id'];
dict['EDIT PROFILE'] = ['EDIT PROFIL'];
dict['PROFILE'] = ['PROFIL'];
dict['Add:'] = ['Tambah:'];
dict['Strike:'] = ['Coret:'];
dict['Buyer/company name'] = ['Pembeli/nama perusahaan'];
dict['Personal ID card'] = ['No. KTP'];
dict['Contact person'] = ['Orang yang dapat dihubungi'];
dict['Expired license date'] = ['Tanggal berakhir ijin usaha'];
dict['Fisherman registration number'] = ['No. registrasi nelayan'];
dict['Unique vessel ID'] = ['Tanda selar'];
dict['Company name'] = ['Nama perusahaan'];

dict['CATCH LIST'] = ['DAFTAR TANGKAPAN'];
dict['EDIT CATCH'] = ['SUNTING TANGKAPAN'];
dict['ADD CATCH'] = ['TAMBAH TANGKAPAN'];
dict['CATCH SOURCE'] = ['SUMBER TANGKAPAN'];
dict['CALC FISH'] = ['HITUNG IKAN'];
dict['DUPLICATE/+OTHER FISH'] = ['GANDAKAN/+IKAN LAIN'];
dict['EDIT FISH IN CATCH'] = ['SUNTING IKAN DI TANGKAPAN'];
dict['ADD DELIVERY'] = ['TAMBAH PENGIRIMAN'];
dict['NEW BORROWER'] = ["PEMINJAM BARU"];
dict['ADD LOAN'] = ['TAMBAH PINJAMAN'];
dict['LOAN LIST'] = ['DAFTAR PINJAMAN'];
dict['PAY LOAN'] = ['PEMBAYARAN PINJAMAN'];
dict['STRIKE ITEMS'] = ['CORET BARANG'];
dict['SELECT LOAN TYPE'] = ['PILIH JENIS PINJAMAN'];
dict['DELIVERY LIST'] = ['DAFTAR KIRIMAN'];
dict['DELETE'] = ['HAPUS'];
dict['SET SELL PRICE'] = ['SETEL HARGA JUAL'];
dict['TRANSACTION DETAIL'] = ['RINCIAN TRANSAKSI'];
dict['LOAN DETAIL'] = ['RINCIAN PINJAMAN'];
dict['Price/kg'] = ['Harga/kg'];
dict['Pay loan date:'] = ['Tanggal pembayaran pinjaman:'];
dict['Paid for '] = ['Pembayaran untuk '];
dict['PLEASE REPORT TO ADMIN VIA EMAIL. CLICK THE BUTTON BELOW'] = ['LAPORKAN KE ADMIN MELALUI EMAIL. KLIK TOMBOL DI BAWAH'];
dict["Synchronization will last for minutes. Please don't close the app during the process. Run the synchronization now?"] = ['Sinkronisasi akan memakan waktu beberapa menit. Jangan tutup aplikasi selama proses berlangsung. Lakukan proses Sinkronisasi sekarang?'];
dict['Transaction report'] = ['Laporan transaksi'];
dict['Loan report'] = ['Laporan pinjaman'];
dict['Fisherman/supplier report'] = ['Laporan nelayan/supplier'];
dict['FISHERMAN/SUPPLIER REPORT'] = ['LAPORAN NELAYAN/SUPPLIER'];
dict['Start Date'] = ['Tanggal Dimulai'];
dict['End Date'] = ['Tanggal Berakhir'];
dict['SHOW REPORT'] = ['TAMPILKAN LAPORAN'];
dict['FILTER REPORT'] = ['SARING LAPORAN'];
dict['TOTAL RESULT:'] = ['TOTAL HASIL:'];
dict['TOTAL LOAN:'] = ['TOTAL PINJAMAN:'];
dict['Result:'] = ['Hasil:'];
dict['RESULT'] = ['HASIL'];
dict['Thank you for registering.'] = ['Terima kasih sudah mendaftar.'];
dict['Our team will verify your data. For further assistance, please check with your Contact Officer.'] = ['Tim kami akan melakukan verifikasi segera. Hubungi petugas untuk bantuan.'];
dict['Transaction Report'] = ['Laporan Transaksi'];
dict['Loan Report'] = ['Laporan Pinjaman'];
dict['Summary'] = ['Ringkasan'];
dict['Daily'] = ['Harian'];
dict['Fisherman/Supplier Report'] = ['Laporan Nelayan/Supplier'];

dict['+CATCH'] = ['+TANGKAPAN'];
dict['+CATCH BY QRCODE'] = ['+TANGKAPAN DENGAN KODE QR'];
dict['Fisherman name'] = ['Nama nelayan'];
dict['Fisherman id card'] = ['No. KTP nelayan'];
dict['Fisherman register number'] = ['No. registrasi nelayan'];
dict['TOTAL OTHER:'] = ['TOTAL LAIN-LAIN:'];
dict['Other:'] = ['Lain-lain:'];
dict['OTHER'] = ['LAIN2'];
dict['NO OTHER EXPENSE PAID ON THIS DATE'] = ['TIDAK ADA PEMBAYARAN LAIN-LAIN TANGGAL INI'];
dict['CAN NOT SCAN QR CODE'] = ['KODE QR TIDAK TERBACA'];
dict['QR CODE ALREADY SCANNED'] = ['KODE QR SUDAH PERNAH DI SCAN'];
dict['CAN NOT SCAN IN OFFLINE MODE'] = ['TIDAK BISA SCAN DI MODE OFFLINE'];
dict['FISHERMAN/SUPPLIER DETAILS'] = ['DETIL HARIAN NELAYAN/SUPPLIER'];
dict['DETAILS'] = ['DETIL HARIAN'];
dict['Preparing delivery sheet..'] = ['Menyiapkan delivery sheet..'];
dict['You have offline data for a week or more. Please sync IMMEDIATELY to prevent data loss and keep it safe in the server.'] = ['Anda belum mengirimkan data seminggu lebih. SEGERA sinkronisasikan data Anda. Apabila terjadi kehilangan data di handphone, data yang belum terkirim ke server akan hilang.'];

dict['Add Fish'] = ['Tambah'];

module.exports.translate = function (txt) {
  if(index === 0) return txt;
  if(!dict[txt]) return txt;
  let arr = dict[txt];

  if(index == 2 && dict[txt].length < index) {
      return txt;
  }
  return dict[txt][index-1];
}