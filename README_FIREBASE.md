Firebase Integration Instructions

1. Create Firebase project and Firestore DB
2. In Project Settings, copy config and paste into firebase/firebase-config.js replacing export
3. Collections used:
   - products (documents representing product objects)
   - orders (documents created by sendOrderToFirestore)
4. After configuring, open the site; it will load products from Firestore and persist orders.
