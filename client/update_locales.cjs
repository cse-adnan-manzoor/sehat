const fs = require('fs');
const path = require('path');

const translations = {
  en: {
    patient: {
      profile: {
        title: "My Profile",
        subtitle: "Manage your personal and medical information",
        editProfile: "Edit Profile",
        cancel: "Cancel",
        personalInfo: "Personal Information",
        fullName: "Full Name",
        phone: "Phone",
        dob: "Date of Birth",
        gender: "Gender",
        bloodGroup: "Blood Group",
        height: "Height (cm)",
        weight: "Weight (kg)",
        emergencyContact: "Emergency Contact",
        medicalInfo: "Medical Information",
        allergies: "Allergies",
        allergiesPlaceholder: "e.g. Penicillin, Nuts (comma-separated)",
        chronicConditions: "Chronic Conditions",
        chronicPlaceholder: "e.g. Diabetes, Hypertension (comma-separated)",
        address: "Address",
        addressPlaceholder: "Your home address",
        saveChanges: "Save Changes",
        successMsg: "Profile updated successfully!",
        failMsg: "Failed to update profile",
        selectMsg: "Select..."
      }
    }
  },
  hi: {
    patient: {
      profile: {
        title: "मेरी प्रोफ़ाइल",
        subtitle: "अपनी व्यक्तिगत और चिकित्सा जानकारी प्रबंधित करें",
        editProfile: "प्रोफ़ाइल संपादित करें",
        cancel: "रद्द करें",
        personalInfo: "व्यक्तिगत जानकारी",
        fullName: "पूरा नाम",
        phone: "फ़ोन",
        dob: "जन्म तिथि",
        gender: "लिंग",
        bloodGroup: "रक्त समूह",
        height: "ऊंचाई (सेमी)",
        weight: "वजन (किलो)",
        emergencyContact: "आपातकालीन संपर्क",
        medicalInfo: "चिकित्सा जानकारी",
        allergies: "एलर्जी",
        allergiesPlaceholder: "जैसे पेनिसिलिन, नट्स (अल्पविराम से अलग)",
        chronicConditions: "दीर्घकालिक रोग",
        chronicPlaceholder: "जैसे मधुमेह, उच्च रक्तचाप (अल्पविराम से अलग)",
        address: "पता",
        addressPlaceholder: "आपका घर का पता",
        saveChanges: "परिवर्तन सहेजें",
        successMsg: "प्रोफ़ाइल सफलतापूर्वक अपडेट की गई!",
        failMsg: "प्रोफ़ाइल अपडेट करने में विफल",
        selectMsg: "चुनें..."
      }
    }
  },
  pa: {
    patient: {
      profile: {
        title: "ਮੇਰੀ ਪ੍ਰੋਫਾਈਲ",
        subtitle: "ਆਪਣੀ ਨਿੱਜੀ ਅਤੇ ਡਾਕਟਰੀ ਜਾਣਕਾਰੀ ਦਾ ਪ੍ਰਬੰਧਨ ਕਰੋ",
        editProfile: "ਪ੍ਰੋਫਾਈਲ ਸੰਪਾਦਿਤ ਕਰੋ",
        cancel: "ਰੱਦ ਕਰੋ",
        personalInfo: "ਨਿੱਜੀ ਜਾਣਕਾਰੀ",
        fullName: "ਪੂਰਾ ਨਾਮ",
        phone: "ਫੋਨ",
        dob: "ਜਨਮ ਮਿਤੀ",
        gender: "ਲਿੰਗ",
        bloodGroup: "ਬਲੱਡ ਗਰੁੱਪ",
        height: "ਕੱਦ (ਸੈ.ਮੀ.)",
        weight: "ਵਜ਼ਨ (ਕਿਲੋ)",
        emergencyContact: "ਐਮਰਜੈਂਸੀ ਸੰਪਰਕ",
        medicalInfo: "ਡਾਕਟਰੀ ਜਾਣਕਾਰੀ",
        allergies: "ਐਲਰਜੀ",
        allergiesPlaceholder: "ਜਿਵੇਂ ਪੈਨਿਸਿਲਿਨ, ਨਟਸ (ਕਾਮੇ ਨਾਲ ਵੱਖ)",
        chronicConditions: "ਗੰਭੀਰ ਬਿਮਾਰੀਆਂ",
        chronicPlaceholder: "ਜਿਵੇਂ ਸ਼ੂਗਰ, ਹਾਈਪਰਟੈਨਸ਼ਨ (ਕਾਮੇ ਨਾਲ ਵੱਖ)",
        address: "ਪਤਾ",
        addressPlaceholder: "ਤੁਹਾਡੇ ਘਰ ਦਾ ਪਤਾ",
        saveChanges: "ਤਬਦੀਲੀਆਂ ਸੁਰੱਖਿਅਤ ਕਰੋ",
        successMsg: "ਪ੍ਰੋਫਾਈਲ ਸਫਲਤਾਪੂਰਵਕ ਅੱਪਡੇਟ ਕੀਤੀ ਗਈ!",
        failMsg: "ਪ੍ਰੋਫਾਈਲ ਅੱਪਡੇਟ ਕਰਨ ਵਿੱਚ ਅਸਫਲ",
        selectMsg: "ਚੁਣੋ..."
      }
    }
  }
};

['en', 'hi', 'pa'].forEach(lang => {
  const p = path.join(__dirname, 'src/locales', lang, 'translation.json');
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  data.patient = { ...(data.patient || {}), profile: translations[lang].patient.profile };
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
