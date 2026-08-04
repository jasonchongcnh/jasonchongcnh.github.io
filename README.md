# Jason Chong's Portfolio & Engineering Sandbox 🚀

Welcome to the personal website and engineering sandbox of **Jason Chong**. This project serves as a showcase of personal software/hardware projects, educational writeups, and active web-based experiments (such as spatial holographic mapping and real-time interactive systems).

---

## 🌟 Project Overview

This repository hosts a multi-functional personal portfolio site built using responsive vanilla web technologies. It is divided into three main sections: a modern homepage with a real-time guestbook, a collection of comprehensive project case studies, and live interactive sandbox applications.

### Key Areas & Features

#### 1. Portfolio Homepage (`index.html`) 📝
- **Location**: Root directory
- **Features**: 
  - Responsive single-page layout with modern navigation.
  - Interactive profile banner, about me section, and dynamic skill grids.
  - Showroom containing details of hardware and software engineering works.
  - **Dynamic Guestbook Comment System**:
    - **Global Sync (Supabase Mode)**: Syncs visitors' feedback in real time to a Supabase DB backend using API keys.
    - **Local Caching (Fallback Mode)**: Safely falls back to HTML5 `LocalStorage` and initializes with pre-seeded mock comments if database connection is offline.
    - **IP Geolocation Engine**: Queries free geographic IP services (`ipwho.is` and `freeipapi.com`) to resolve the poster's city/country and generates corresponding country-flag emojis automatically.
    - Built-in loading states, post validation, and sleek glassmorphism inputs.

#### 2. Project Case Studies (`works/`) 📚
- **Location**: `works/` directory
- A collection of 14 distinct case studies detailing design decisions, schematics, and implementation methodologies for hardware/software projects:
  - **vr.html**: Concepts and implementations in Virtual Reality.
  - **notion.html**: Customized Notion productivity systems and templates.
  - **wire-loop-game.html**: Physical/electronic wire-loop hardware game.
  - **stem-racing.html**: STEM educational racing car projects.
  - **shm-map.html**: Smart Health & Smart City Map planning dashboard.
  - **smart-pot.html**: IoT-connected smart gardening pot system.
  - **holo-map.html**: Conceptual writeup and design of the Holographic Map.
  - **sumo-robot.html**: Hardware sumo fighting robot.
  - **solar-system.html**: Detailed review of the Solar System model.
  - **macau-map.html**: Historic map visualization of Macau.
  - **lrt.html**: Mobile/web concept tracker for the Macao Light Rapid Transit system.
  - **drink-map.html**: Beverage-spot mapping platform.
  - **sentra.html**: SENTRA smart environmental sensor tracking system.
  - **space.html**: Macau Space Dream Project aerospace STEM workspace.

#### 3. Live Sandbox Experiments (`projects/`) 🗺️
- **Location**: `projects/` directory
- High-fidelity, client-side web applications and visualizers:
  - **Holo-Map.html**: A futuristic map interface featuring glassmorphism floating panels, theme switching, geolocation, custom SVG markers for cultural sites/schools, and Gaussian Splatting concepts.
  - **Map-upload.html**: A video-upload testing interface that matches video files with user-selected coordinates or physical device GPS positioning.
  - **Drink-Map.html**: Live map application tracking local food and drink spots.
  - **Macau-Map.html**: Fully responsive historical map visualizer.
  - **solar-system.html**: Interactive 3D graphics simulating planets revolving around the Sun.

#### 4. Legacy Archive (`V1/`) 🏛️
- **Location**: `V1/` directory
- Contains files and translations representing the original structure of the website (e.g. `V1.html`, `introduction.html`, `Page2.html`, and their English translations) kept for version tracking and history.

---

## 🛠️ Technologies & Libraries Used

- **Core**: HTML5, CSS3, Modern JavaScript (ES6+), XML (Sitemaps)
- **Design & Layout**:
  - Vanilla CSS Grid & Flexbox
  - Custom CSS variables supporting glassmorphic transparency, backdrop filters, and gradients
  - [Google Fonts](https://fonts.google.com) (Inter typography)
  - [Boxicons CDN](https://boxicons.com) (Icons)
- **Animations**:
  - [ScrollReveal.js](https://scrollrevealjs.org/) (Scroll-triggered animations)
- **APIs & Backend**:
  - [Supabase client library](https://supabase.com) (Real-time comments synchronization)
  - [ipwho.is API](https://ipwho.is/) & [Free IP API](https://freeipapi.com) (Dynamic geolocation identification)
  - HTML5 Geolocation API (Device positioning)
