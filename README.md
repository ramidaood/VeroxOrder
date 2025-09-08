# VeroxOrder - Business Items Ordering Platform

A React-based ordering platform for business-related items with custom logo integration. This application allows businesses to order customized items like pens, business cards, bags, receipts, and more with their branding.

## Features

### Current Features
- ✅ User Authentication (Firebase Auth)
- ✅ Product Catalog with Categories
- ✅ Custom Logo Upload
- ✅ Order Management System
- ✅ Order History with Reorder Functionality
- ✅ Responsive Design with Tailwind CSS
- ✅ Real-time Order Tracking

### Planned Features
- 🔄 AI-Powered Graphic Design Generation
- 🔄 Advanced Product Customization
- 🔄 Payment Integration
- 🔄 Admin Dashboard
- 🔄 Email Notifications

## Tech Stack

- **Frontend**: React 18 + TypeScript
- **Build Tool**: Vite
- **Styling**: Tailwind CSS
- **Backend**: Firebase (Auth, Firestore, Storage)
- **Routing**: React Router DOM

## Quick Start

### Prerequisites
- Node.js (v16 or higher)
- npm or yarn
- Firebase account

### Installation

1. **Clone the repository**
   ```bash
   git clone <your-repo-url>
   cd VeroxOrder
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Firebase Setup**
   - Create a new Firebase project at [Firebase Console](https://console.firebase.google.com/)
   - Enable Authentication, Firestore, and Storage
   - Copy your Firebase config and update `src/config/firebase.ts`

4. **Configure Firebase**
   Update the Firebase configuration in `src/config/firebase.ts`:
   ```javascript
   const firebaseConfig = {
     apiKey: "your-api-key",
     authDomain: "your-project.firebaseapp.com",
     projectId: "your-project-id",
     storageBucket: "your-project.appspot.com",
     messagingSenderId: "123456789",
     appId: "your-app-id"
   };
   ```

5. **Run the development server**
   ```bash
   npm run dev
   ```

6. **Open your browser**
   Navigate to `http://localhost:5173`

## Project Structure

```
VeroxOrder/
├── src/
│   ├── components/         # Reusable UI components
│   │   └── Navbar.tsx
│   ├── pages/             # Main application pages
│   │   ├── Dashboard.tsx
│   │   ├── Login.tsx
│   │   ├── Register.tsx
│   │   ├── Products.tsx
│   │   ├── Orders.tsx
│   │   └── OrderHistory.tsx
│   ├── contexts/          # React contexts
│   │   └── AuthContext.tsx
│   ├── config/            # Configuration files
│   │   └── firebase.ts
│   ├── types/             # TypeScript type definitions
│   │   └── index.ts
│   ├── App.tsx            # Main app component
│   ├── main.tsx           # Entry point
│   └── index.css          # Global styles
├── public/                # Static assets
├── package.json
├── tailwind.config.js     # Tailwind CSS configuration
├── postcss.config.js      # PostCSS configuration
├── vite.config.ts         # Vite configuration
└── README.md
```

## Available Scripts

- `npm run dev` - Start development server
- `npm run build` - Build for production
- `npm run preview` - Preview production build
- `npm run lint` - Run ESLint

## Product Categories

The platform supports the following business item categories:

1. **Pens** - Custom ballpoint pens with logo printing
2. **Business Cards** - Professional cards with various finishes
3. **Bags** - Eco-friendly paper bags with custom printing
4. **Receipt Books** - Professional receipt books with carbon copies
5. **Letterheads** - Branded letterhead paper
6. **Promotional Items** - Various promotional products (keychains, magnets, etc.)

## Firebase Collections

### Users Collection (`users`)
```javascript
{
  uid: string,
  email: string,
  displayName?: string,
  businessName?: string,
  phoneNumber?: string
}
```

### Orders Collection (`orders`)
```javascript
{
  id: string,
  userId: string,
  items: OrderItem[],
  totalAmount: number,
  status: 'pending' | 'confirmed' | 'in-production' | 'shipped' | 'delivered' | 'cancelled',
  createdAt: Timestamp,
  updatedAt: Timestamp,
  shippingAddress: Address,
  notes?: string
}
```

## Customization Options

Each product supports various customization options:
- **Colors** - Available color choices
- **Logos** - Logo upload and placement
- **Text** - Custom text input
- **Materials** - Material selection
- **Sizes** - Size options

## Order Flow

1. **Browse Products** - View available business items
2. **Select Product** - Choose item to customize
3. **Customize** - Add logo, select options, set quantity
4. **Add to Order** - Add customized item to order
5. **Review** - Review all items in order
6. **Shipping** - Enter shipping information
7. **Submit** - Place the order

## Future Enhancements

### AI Graphic Design Integration
- Automated logo design suggestions
- AI-powered layout optimization
- Design templates generation

### Advanced Features
- Real-time pricing calculator
- 3D product preview
- Bulk ordering discounts
- Multi-user business accounts

## Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## License

This project is licensed under the MIT License.

## Support

For support or questions, please contact [your-email@domain.com]

---

**Note**: This is a subdomain application designed to work alongside a main printing business website. It provides a dedicated ordering interface for business customers.