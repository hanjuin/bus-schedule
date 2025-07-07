# 🚌 Bus Timetable Display - AT HOP Real-Time Dashboard

This project is a **personal room display** that shows real-time Auckland Transport (AT) bus schedule updates for your most-used bus stop. Built using React on the frontend and Node.js on the backend, this system fetches and displays live transit data using the AT HOP API and weather updates via WeatherAPI.

Designed to run on a fullscreen tablet (e.g., iPad) in your room, it helps you plan your trips efficiently without constantly checking your phone.

---

## 🌟 Features

- 🔁 Real-time bus arrival times from AT HOP API
- 🗺️ Live bus positions using a Leaflet-based map
- 🎨 Clean and responsive UI with Tailwind CSS
- ☁️ Weather forecast integration using WeatherAPI
- 📱 Fullscreen web app optimized for tablet displays

---

## 🧰 Tech Stack

### 🔷 Frontend
- **React** (Vite)
- **Tailwind CSS** for utility-first styling
- **Leaflet.js** for map and marker rendering
- **Axios** for API communication

### 🔶 Backend
- **Node.js** with **Express**
- Custom RESTful endpoints using **`POST`** and **`GET`**
- Handles:
  - Fetching bus data from AT HOP API
  - Proxying and caching weather data
  - Aggregating response for the frontend

---

## 📸 Preview

> _Include a screenshot or photo of the UI running on your display device_

---

## ⚙️ Setup Instructions

### 1. Clone the repository

```bash
git clone https://github.com/yourusername/bus-timetable-display.git
cd bus-timetable-display
