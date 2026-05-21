const fs = require('fs');
const path = require('path');

const translations = {
  en: {
    pharmacy: {
      title: "Pharmacy",
      subtitle: "Order genuine medicines with fast delivery",
      cart: "Cart",
      searchPlaceholder: "Search medicines...",
      allCategories: "All Categories",
      all: "All",
      addToCart: "Add to Cart",
      inCart: "In Cart",
      addedToCart: "added to cart",
      failAddToCart: "Failed to add to cart. Please login first.",
      off: "off"
    },
    cart: {
      title: "Your Cart",
      itemsInCart: "item(s) in your cart",
      emptyCart: "Your cart is empty",
      emptyCartDesc: "Add medicines from the pharmacy to get started",
      goPharmacy: "Go to Pharmacy",
      orderSummary: "Order Summary",
      subtotal: "Subtotal",
      youSave: "You save",
      delivery: "Delivery",
      free: "FREE",
      total: "Total",
      deliveryAddress: "Delivery Address",
      addressPlaceholder: "Enter your full delivery address...",
      placeOrder: "Place Order",
      secureInfo: "Secure payment · 100% genuine medicines",
      enterAddress: "Please enter delivery address",
      orderSuccess: "Order placed successfully! 🎉",
      orderFail: "Failed to place order",
      itemRemoved: "Item removed"
    },
    orders: {
      title: "My Orders",
      subtitle: "Track all your medicine orders",
      emptyOrders: "No orders yet",
      emptyOrdersDesc: "Order medicines from the pharmacy to see them here",
      orderId: "Order #"
    },
    healthRecords: {
      title: "Health Records",
      subtitle: "Store and manage all your medical documents",
      addRecord: "Add Record",
      emptyRecords: "No health records",
      emptyRecordsDesc: "Add your first health record to keep your medical history organized",
      addSuccess: "Health record added!",
      addFail: "Failed to add record",
      delConfirm: "Delete this record?",
      delSuccess: "Record deleted",
      loadFail: "Failed to load records",
      modalTitle: "Add Health Record",
      modalTitleInput: "Title *",
      titlePlaceholder: "e.g. Blood Test Report",
      type: "Type *",
      docName: "Doctor Name",
      docPlaceholder: "Dr. Name",
      date: "Date",
      description: "Description",
      descPlaceholder: "Brief description...",
      fileUrl: "File URL (optional)",
      cancel: "Cancel"
    }
  },
  hi: {
    pharmacy: {
      title: "फार्मेसी",
      subtitle: "तेजी से वितरण के साथ असली दवाएं ऑर्डर करें",
      cart: "कार्ट",
      searchPlaceholder: "दवाएं खोजें...",
      allCategories: "सभी श्रेणियां",
      all: "सभी",
      addToCart: "कार्ट में डालें",
      inCart: "कार्ट में है",
      addedToCart: "कार्ट में जोड़ा गया",
      failAddToCart: "कार्ट में जोड़ने में विफल। कृपया पहले लॉगिन करें।",
      off: "छूट"
    },
    cart: {
      title: "आपकी कार्ट",
      itemsInCart: "आपकी कार्ट में आइटम",
      emptyCart: "आपकी कार्ट खाली है",
      emptyCartDesc: "शुरू करने के लिए फार्मेसी से दवाएं जोड़ें",
      goPharmacy: "फार्मेसी पर जाएं",
      orderSummary: "ऑर्डर सारांश",
      subtotal: "उप-योग",
      youSave: "आपकी बचत",
      delivery: "वितरण",
      free: "मुफ़्त",
      total: "कुल",
      deliveryAddress: "वितरण का पता",
      addressPlaceholder: "अपना पूरा वितरण पता दर्ज करें...",
      placeOrder: "ऑर्डर दें",
      secureInfo: "सुरक्षित भुगतान · 100% असली दवाएं",
      enterAddress: "कृपया वितरण पता दर्ज करें",
      orderSuccess: "ऑर्डर सफलतापूर्वक दिया गया! 🎉",
      orderFail: "ऑर्डर देने में विफल",
      itemRemoved: "आइटम हटा दिया गया"
    },
    orders: {
      title: "मेरे ऑर्डर",
      subtitle: "अपने सभी दवा ऑर्डर को ट्रैक करें",
      emptyOrders: "अभी तक कोई ऑर्डर नहीं",
      emptyOrdersDesc: "उन्हें यहां देखने के लिए फार्मेसी से दवाएं ऑर्डर करें",
      orderId: "ऑर्डर #"
    },
    healthRecords: {
      title: "स्वास्थ्य रिकॉर्ड",
      subtitle: "अपने सभी मेडिकल दस्तावेज़ स्टोर और प्रबंधित करें",
      addRecord: "रिकॉर्ड जोड़ें",
      emptyRecords: "कोई स्वास्थ्य रिकॉर्ड नहीं",
      emptyRecordsDesc: "अपना चिकित्सा इतिहास व्यवस्थित रखने के लिए अपना पहला स्वास्थ्य रिकॉर्ड जोड़ें",
      addSuccess: "स्वास्थ्य रिकॉर्ड जोड़ा गया!",
      addFail: "रिकॉर्ड जोड़ने में विफल",
      delConfirm: "क्या आप इस रिकॉर्ड को हटाना चाहते हैं?",
      delSuccess: "रिकॉर्ड हटा दिया गया",
      loadFail: "रिकॉर्ड लोड करने में विफल",
      modalTitle: "स्वास्थ्य रिकॉर्ड जोड़ें",
      modalTitleInput: "शीर्षक *",
      titlePlaceholder: "जैसे रक्त परीक्षण रिपोर्ट",
      type: "प्रकार *",
      docName: "डॉक्टर का नाम",
      docPlaceholder: "डॉ. का नाम",
      date: "दिनांक",
      description: "विवरण",
      descPlaceholder: "संक्षिप्त विवरण...",
      fileUrl: "फ़ाइल URL (वैकल्पिक)",
      cancel: "रद्द करें"
    }
  },
  pa: {
    pharmacy: {
      title: "ਫਾਰਮੇਸੀ",
      subtitle: "ਤੇਜ਼ੀ ਨਾਲ ਡਿਲੀਵਰੀ ਦੇ ਨਾਲ ਅਸਲੀ ਦਵਾਈਆਂ ਆਰਡਰ ਕਰੋ",
      cart: "ਕਾਰਟ",
      searchPlaceholder: "ਦਵਾਈਆਂ ਖੋਜੋ...",
      allCategories: "ਸਾਰੀਆਂ ਸ਼੍ਰੇਣੀਆਂ",
      all: "ਸਾਰੇ",
      addToCart: "ਕਾਰਟ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰੋ",
      inCart: "ਕਾਰਟ ਵਿੱਚ ਹੈ",
      addedToCart: "ਕਾਰਟ ਵਿੱਚ ਸ਼ਾਮਲ ਕੀਤਾ ਗਿਆ",
      failAddToCart: "ਕਾਰਟ ਵਿੱਚ ਸ਼ਾਮਲ ਕਰਨ ਵਿੱਚ ਅਸਫਲ। ਕਿਰਪਾ ਕਰਕੇ ਪਹਿਲਾਂ ਲੌਗਇਨ ਕਰੋ।",
      off: "ਛੋਟ"
    },
    cart: {
      title: "ਤੁਹਾਡੀ ਕਾਰਟ",
      itemsInCart: "ਤੁਹਾਡੀ ਕਾਰਟ ਵਿੱਚ ਆਈਟਮਾਂ",
      emptyCart: "ਤੁਹਾਡੀ ਕਾਰਟ ਖਾਲੀ ਹੈ",
      emptyCartDesc: "ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਫਾਰਮੇਸੀ ਤੋਂ ਦਵਾਈਆਂ ਸ਼ਾਮਲ ਕਰੋ",
      goPharmacy: "ਫਾਰਮੇਸੀ 'ਤੇ ਜਾਓ",
      orderSummary: "ਆਰਡਰ ਸੰਖੇਪ",
      subtotal: "ਉਪ-ਕੁੱਲ",
      youSave: "ਤੁਸੀਂ ਬਚਾਉਂਦੇ ਹੋ",
      delivery: "ਡਿਲਿਵਰੀ",
      free: "ਮੁਫਤ",
      total: "ਕੁੱਲ",
      deliveryAddress: "ਡਿਲਿਵਰੀ ਦਾ ਪਤਾ",
      addressPlaceholder: "ਆਪਣਾ ਪੂਰਾ ਡਿਲਿਵਰੀ ਪਤਾ ਦਾਖਲ ਕਰੋ...",
      placeOrder: "ਆਰਡਰ ਦਿਓ",
      secureInfo: "ਸੁਰੱਖਿਅਤ ਭੁਗਤਾਨ · 100% ਅਸਲੀ ਦਵਾਈਆਂ",
      enterAddress: "ਕਿਰਪਾ ਕਰਕੇ ਡਿਲਿਵਰੀ ਪਤਾ ਦਾਖਲ ਕਰੋ",
      orderSuccess: "ਆਰਡਰ ਸਫਲਤਾਪੂਰਵਕ ਦਿੱਤਾ ਗਿਆ! 🎉",
      orderFail: "ਆਰਡਰ ਦੇਣ ਵਿੱਚ ਅਸਫਲ",
      itemRemoved: "ਆਈਟਮ ਹਟਾ ਦਿੱਤੀ ਗਈ"
    },
    orders: {
      title: "ਮੇਰੇ ਆਰਡਰ",
      subtitle: "ਆਪਣੇ ਸਾਰੇ ਦਵਾਈ ਆਰਡਰ ਟਰੈਕ ਕਰੋ",
      emptyOrders: "ਅਜੇ ਕੋਈ ਆਰਡਰ ਨਹੀਂ",
      emptyOrdersDesc: "ਉਹਨਾਂ ਨੂੰ ਇੱਥੇ ਦੇਖਣ ਲਈ ਫਾਰਮੇਸੀ ਤੋਂ ਦਵਾਈਆਂ ਆਰਡਰ ਕਰੋ",
      orderId: "ਆਰਡਰ #"
    },
    healthRecords: {
      title: "ਸਿਹਤ ਰਿਕਾਰਡ",
      subtitle: "ਆਪਣੇ ਸਾਰੇ ਡਾਕਟਰੀ ਦਸਤਾਵੇਜ਼ ਸਟੋਰ ਅਤੇ ਪ੍ਰਬੰਧਿਤ ਕਰੋ",
      addRecord: "ਰਿਕਾਰਡ ਸ਼ਾਮਲ ਕਰੋ",
      emptyRecords: "ਕੋਈ ਸਿਹਤ ਰਿਕਾਰਡ ਨਹੀਂ",
      emptyRecordsDesc: "ਆਪਣਾ ਡਾਕਟਰੀ ਇਤਿਹਾਸ ਸੰਗਠਿਤ ਰੱਖਣ ਲਈ ਆਪਣਾ ਪਹਿਲਾ ਸਿਹਤ ਰਿਕਾਰਡ ਸ਼ਾਮਲ ਕਰੋ",
      addSuccess: "ਸਿਹਤ ਰਿਕਾਰਡ ਸ਼ਾਮਲ ਕੀਤਾ ਗਿਆ!",
      addFail: "ਰਿਕਾਰਡ ਸ਼ਾਮਲ ਕਰਨ ਵਿੱਚ ਅਸਫਲ",
      delConfirm: "ਕੀ ਤੁਸੀਂ ਇਸ ਰਿਕਾਰਡ ਨੂੰ ਮਿਟਾਉਣਾ ਚਾਹੁੰਦੇ ਹੋ?",
      delSuccess: "ਰਿਕਾਰਡ ਮਿਟਾ ਦਿੱਤਾ ਗਿਆ",
      loadFail: "ਰਿਕਾਰਡ ਲੋਡ ਕਰਨ ਵਿੱਚ ਅਸਫਲ",
      modalTitle: "ਸਿਹਤ ਰਿਕਾਰਡ ਸ਼ਾਮਲ ਕਰੋ",
      modalTitleInput: "ਸਿਰਲੇਖ *",
      titlePlaceholder: "ਜਿਵੇਂ ਖੂਨ ਦੀ ਜਾਂਚ ਦੀ ਰਿਪੋਰਟ",
      type: "ਕਿਸਮ *",
      docName: "ਡਾਕਟਰ ਦਾ ਨਾਮ",
      docPlaceholder: "ਡਾ. ਦਾ ਨਾਮ",
      date: "ਮਿਤੀ",
      description: "ਵਰਣਨ",
      descPlaceholder: "ਸੰਖੇਪ ਵਰਣਨ...",
      fileUrl: "ਫਾਈਲ URL (ਵਿਕਲਪਿਕ)",
      cancel: "ਰੱਦ ਕਰੋ"
    }
  }
};

['en', 'hi', 'pa'].forEach(lang => {
  const p = path.join(__dirname, 'src/locales', lang, 'translation.json');
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  data.patient = { ...(data.patient || {}), ...translations[lang] };
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
