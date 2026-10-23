# Hydro-LoRa: Sistem Peringatan Dini Banjir & Pemantauan Sungai Citarum (Dayeuhkolot)
> **IoT Telemetri LoRa SX1276 • Sensor Ultrasonik ToF • Vision AI CCTV • Peta Hidrologi Dayeuhkolot • Evaluasi Bab IV**

[![License: MIT](https://img.shields.io/badge/License-MIT-emerald.svg)](LICENSE)
[![Vite](https://img.shields.io/badge/Vite-8.x-646CFF.svg?logo=vite&logoColor=white)](https://vitejs.dev/)
[![React](https://img.shields.io/badge/React-19.x-61DAFB.svg?logo=react&logoColor=black)](https://react.dev/)
[![Tailwind CSS](https://img.shields.io/badge/TailwindCSS-4.x-38B2AC.svg?logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
[![GitHub Actions](https://img.shields.io/badge/GitHub%20Actions-CI%2FCD%20Pages-2088FF.svg?logo=github-actions&logoColor=white)](.github/workflows/deploy.yml)

---

## 📌 Ringkasan Proyek (Overview)

Aplikasi web ini merupakan platform pemantauan, simulasi, dan sistem peringatan dini (*Early Warning System* / EWS) banjir terpadu untuk kawasan rawan genangan **Kecamatan Dayeuhkolot, Kabupaten Bandung** (Daerah Aliran Sungai Citarum). 

Dikembangkan berdasarkan riset instrumentasi dan tugas akhir / skripsi teknik, sistem ini mengintegrasikan:
1. **Node Sensor IoT Lapangan**: Berbasis mikrokontroler (ESP32/STM32) + Transceiver Semtech SX1276 LoRa (915 MHz / 433 MHz), transduser ultrasonik *waterproof* JSN-SR04T, dan sensor curah hujan optik/tipping bucket.
2. **Kalkulator Hidrolika & Fisika Gelombang**: Perhitungan *Time-of-Flight* (ToF) bunyi terkompensasi suhu ($v = 331.3 \sqrt{1 + T/273.15}$), debit aliran sungai Manning ($Q = \frac{1}{n} A R^{2/3} S^{1/2}$), dan *Rate of Rise* ($dh/dt$).
3. **Simulasi Jangkauan & Propagasi LoRa**: Model Log-Distance Path Loss dengan verifikasi empiris *Packet Delivery Ratio* (PDR), RSSI, SNR, dan *Fresnel Zone Clearance*.
4. **CCTV Vision AI Edge Monitoring**: Deteksi tumpukan sampah sungai (*debris detection*) dan klasifikasi intensitas hujan (*optical rain droplet density*) dengan *bounding box* serta *confidence score*.
5. **Peta Geografis Interaktif Dayeuhkolot**: Pemetaan zona genangan rawan (Bojong Asih, Cangkuang Wetan, Citeureup, Jembatan Dayeuhkolot) dan rute evakuasi warga.
6. **Modul Pengujian & Evaluasi Kinerja (Bab IV)**: Analisis regresi linear sensor ultrasonik ($R^2$, MAE, RMSE), matriks konfusi deteksi AI (Akurasi, Presisi, Recall, F1-Score), uji jangkauan LoRa, dan generator naskah Bab IV skripsi.

---

## 🚀 Panduan Cepat ke GitHub & GitHub Pages

### 1. Inisialisasi & Push ke GitHub

Jalankan perintah berikut di terminal komputer lokal Anda:

```bash
# 1. Pastikan Anda berada di direktori proyek
git init

# 2. Tambahkan semua file proyek
git add .

# 3. Buat commit pertama
git commit -m "feat: inisialisasi Hydro-LoRa Flood Early Warning System Dayeuhkolot"

# 4. Ubah nama branch utama menjadi main
git branch -M main

# 5. Sambungkan ke repositori GitHub Anda (ganti username dan repo-name)
git remote add origin https://github.com/<USERNAME-ANDA>/<NAMA-REPOSITORI>.git

# 6. Push kode ke GitHub
git push -u origin main
```

### 2. Mengaktifkan GitHub Pages (Gratis & Otomatis)

Repositori ini sudah dilengkapi file otomatis **GitHub Actions** (`.github/workflows/deploy.yml`):

1. Buka repositori Anda di browser: `https://github.com/<USERNAME>/<REPO>`
2. Klik tab **Settings** (Pengaturan).
3. Pada bilah menu kiri, pilih **Pages**.
4. Di bagian **Build and deployment** -> **Source**, pilih **GitHub Actions**.
5. Setiap kali Anda melakukan `git push origin main`, GitHub Actions akan otomatis mengompilasi dan mempublikasikan aplikasi ke:
   ```
   https://<USERNAME>.github.io/<REPO>/
   ```

---

## 💻 Menjalankan di Komputer Lokal (Local Development)

### Prasyarat
- Node.js versi 18 atau 20+
- npm atau pnpm

```bash
# Clone repositori
git clone https://github.com/<USERNAME-ANDA>/<NAMA-REPOSITORI>.git
cd <NAMA-REPOSITORI>

# Install dependensi
npm install

# Jalankan server pengembangan
npm run dev
```

Aplikasi dapat diakses di browser melalui `http://localhost:3000` (atau port yang ditentukan Vite).

### Build untuk Produksi
```bash
npm run build
```
Hasil build statis tersimpan di folder `dist/` dan siap diunggah ke penyedia hosting statis mana pun (GitHub Pages, Vercel, Netlify, Cloudflare Pages).

---

## 📐 Arsitektur Sistem & Spesifikasi Teknis

### A. Spesifikasi Perangkat Keras (Hardware)
| Komponen | Spesifikasi / Model | Fungsi |
|---|---|---|
| **Mikrokontroler** | ESP32-WROOM-32 / Heltec WiFi LoRa 32 | Pengolah sinyal ADC, filter moving average, kontroler transmisi |
| **Transceiver LoRa** | Semtech SX1276 / RFM95W (915 MHz / 433 MHz) | Komunikasi nirkabel telemetri jarak jauh hingga 10+ km |
| **Sensor Ketinggian** | JSN-SR04T / AJ-SR04M (Waterproof Ultrasonic) | Pengukur jarak permukaan air dengan pulsa ultrasonik 40 kHz |
| **Sensor Curah Hujan**| Optical Tipping Bucket / RG-11 Rain Sensor | Pengukur intensitas presipitasi (mm/jam) |
| **Sensor Suhu** | DS18B20 (Waterproof) / BME280 | Kompensasi kecepatan rambat gelombang suara di udara |
| **Catu Daya** | Panel Surya Monokristalin 20W + MPPT + LiFePO4 12V 7Ah | Sumber daya otonom pos pengamatan lapangan |
| **Sistem Peringatan**| Klakson Sirine 120 dB & Strobe Light Relay | Peringatan dini fisik warga sekitar bantaran sungai |

### B. Rumus & Landasan Matematika

#### 1. Kecepatan Suara & Ketinggian Air
$$v(T) = 331.3 \times \sqrt{1 + \frac{T}{273.15}} \quad (\text{m/s})$$
$$d = \frac{v(T) \times t_{\text{echo}}}{2 \times 10^4} \quad (\text{cm})$$
$$h_{\text{air}} = H_{\text{tiang}} - d \quad (\text{cm})$$

#### 2. Persamaan Debit Aliran Manning
$$Q = \frac{1}{n} \cdot A \cdot R^{2/3} \cdot S^{1/2} \quad (\text{m}^3/\text{s})$$
Dimana $n$ adalah koefisien kekasaran Manning (0.035 saluran alami bervegetasi/lumpur Citarum), $A$ luas penampang basah, $R = A / P$ jari-jari hidrolis, dan $S$ kemiringan garis energi.

#### 3. Log-Distance Path Loss & Link Budget LoRa
$$PL(d) = PL(d_0) + 10 \cdot \gamma \cdot \log_{10}\left(\frac{d}{d_0}\right) + X_\sigma$$
$$\text{RSSI} = P_{\text{tx}} + G_{\text{tx}} + G_{\text{rx}} - PL(d)$$

---

## 🗂️ Struktur Direktori Repositori

```text
├── .github/
│   └── workflows/
│       └── deploy.yml          # GitHub Actions deployment otomatis ke Pages
├── src/
│   ├── components/
│   │   ├── DayeuhkolotFloodMap.tsx        # Peta spasial GIS rawan banjir Dayeuhkolot
│   │   ├── CCTVMonitoringStation.tsx      # Kamera vision AI deteksi sampah & hujan
│   │   ├── LoraRangeSimulator.tsx         # Simulasi propagasi & jangkauan sinyal LoRa
│   │   ├── LoraTransmissionPipeline.tsx   # Visualisasi frame paket data biner LoRa
│   │   ├── PerformanceEvaluationSection.tsx# Evaluasi & Pengujian Bab IV
│   │   ├── RiverCrossSection.tsx          # Penampang melintang debit sungai Citarum
│   │   ├── RealTimeHydrograph.tsx         # Grafik hidrograf telemetri dinamis
│   │   ├── PhysicsFormulaCard.tsx         # Teori rumus hidrolika & fisika gelombang
│   │   ├── EvacuationMitigationView.tsx   # Panduan evakuasi & SOP BPBD
│   │   ├── AIFloodAssistant.tsx           # Konsultasi EWS cerdas
│   │   ├── MultiStationGrid.tsx           # Panel pantau seluruh pos stasiun
│   │   └── HeaderNav.tsx                  # Navigasi utama dengan modal panduan GitHub
│   ├── types/
│   │   └── flood.ts                       # Definisi tipe data TypeScript telemetri EWS
│   ├── utils/
│   │   ├── audioSynth.ts                  # Web Audio API generator sirine darurat
│   │   └── physicsCalculations.ts         # Library fungsi matematika & hidrolika
│   ├── App.tsx                            # Root state & integrasi dashboard
│   ├── main.tsx                           # Entry point React
│   └── index.css                          # Tailwind CSS styling
├── .gitignore                             # Aturan pengabaian file Git
├── index.html                             # Template HTML dengan metadata SEO EWS
├── package.json                           # Dependensi & skrip npm
├── tsconfig.json                          # Konfigurasi TypeScript
├── vite.config.ts                         # Konfigurasi bundler Vite (base: './')
├── LICENSE                                # Lisensi MIT Open Source
└── README.md                              # Dokumentasi lengkap repositori
```

---

## 📑 Sitasi & Referensi Akademik

Jika Anda menggunakan proyek ini sebagai rujukan skripsi, tugas akhir, atau penelitian:
```bibtex
@misc{hydro_lora_dayeuhkolot_2025,
  title={Sistem Telemetri Peringatan Dini Banjir Sungai Citarum Berbasis IoT LoRa dan Edge Vision AI},
  author={Tim Pengembang Hydro-LoRa Dayeuhkolot},
  year={2025},
  publisher={GitHub},
  howpublished={\url{https://github.com}}
}
```

---

## 📄 Lisensi

Proyek ini didistribusikan di bawah lisensi **MIT License**. Silakan gunakan, modifikasi, dan kembangkan untuk kepentingan riset kemanusiaan dan mitigasi bencana.
