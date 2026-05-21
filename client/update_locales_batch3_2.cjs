const fs = require('fs');
const path = require('path');

const translations = {
  en: {
    symptomChecker: {
      title: "AI Symptom Checker",
      subtitle: "Describe your symptoms to get a preliminary health assessment",
      step1: "Symptoms",
      step2: "Details",
      step3: "Results",
      whatSymptoms: "What symptoms are you experiencing?",
      selectAll: "Select all that apply:",
      selected: "Selected:",
      next: "Next",
      aboutYou: "Tell us a bit about yourself",
      age: "Age",
      agePlaceholder: "Enter your age",
      gender: "Gender",
      analyze: "🧠 Analyze Symptoms",
      back: "Back",
      severity: "Severity:",
      basedOn: "Based on your reported symptoms",
      conditions: "Possible Conditions",
      recommendations: "Recommendations",
      recommendedSpecialists: "Recommended Specialists:",
      checkAgain: "Check Again",
      findDoctor: "Find a Doctor",
      errSelect: "Please select at least one symptom",
      errFail: "Analysis failed. Please try again."
    },
    videoConsultation: {
      statusWaiting: "Waiting for other participant...",
      statusConnected: "Connected",
      statusLeft: "Participant left",
      statusJoining: "Participant joined — connecting...",
      statusDenied: "Camera/microphone access denied",
      statusUserLeft: "Participant has left the call",
      unmute: "Unmute",
      mute: "Mute",
      startVideo: "Start Video",
      stopVideo: "Stop Video",
      endCall: "End Call"
    },
    chat: {
      title: "Messages",
      searchPlaceholder: "Search conversations...",
      emptyConversations: "No conversations yet. Book an appointment to start chatting with a doctor.",
      noMessages: "No messages yet",
      emptyChatTitle: "Select a conversation",
      emptyChatDesc: "Choose a conversation from the sidebar or start a new one after booking an appointment",
      typing: "typing...",
      doctorRole: "Doctor",
      typeMessage: "Type a message..."
    }
  },
  hi: {
    symptomChecker: {
      title: "AI लक्षण चेकर",
      subtitle: "प्रारंभिक स्वास्थ्य मूल्यांकन प्राप्त करने के लिए अपने लक्षणों का वर्णन करें",
      step1: "लक्षण",
      step2: "विवरण",
      step3: "परिणाम",
      whatSymptoms: "आप किन लक्षणों का अनुभव कर रहे हैं?",
      selectAll: "जो भी लागू हो उसे चुनें:",
      selected: "चयनित:",
      next: "अगला",
      aboutYou: "हमें अपने बारे में थोड़ा बताएं",
      age: "आयु",
      agePlaceholder: "अपनी आयु दर्ज करें",
      gender: "लिंग",
      analyze: "🧠 लक्षणों का विश्लेषण करें",
      back: "वापस",
      severity: "गंभीरता:",
      basedOn: "आपके बताए गए लक्षणों के आधार पर",
      conditions: "संभावित स्थितियां",
      recommendations: "सिफारिशें",
      recommendedSpecialists: "अनुशंसित विशेषज्ञ:",
      checkAgain: "फिर से जांचें",
      findDoctor: "डॉक्टर खोजें",
      errSelect: "कृपया कम से कम एक लक्षण चुनें",
      errFail: "विश्लेषण विफल रहा। कृपया पुनः प्रयास करें।"
    },
    videoConsultation: {
      statusWaiting: "अन्य प्रतिभागी की प्रतीक्षा हो रही है...",
      statusConnected: "जुड़ा हुआ",
      statusLeft: "प्रतिभागी चला गया",
      statusJoining: "प्रतिभागी जुड़ गया - कनेक्ट हो रहा है...",
      statusDenied: "कैमरा/माइक्रोफ़ोन एक्सेस अस्वीकृत",
      statusUserLeft: "प्रतिभागी कॉल से बाहर हो गया है",
      unmute: "अनम्यूट",
      mute: "म्यूट",
      startVideo: "वीडियो शुरू करें",
      stopVideo: "वीडियो बंद करें",
      endCall: "कॉल समाप्त करें"
    },
    chat: {
      title: "संदेश",
      searchPlaceholder: "बातचीत खोजें...",
      emptyConversations: "अभी तक कोई बातचीत नहीं। डॉक्टर से चैट शुरू करने के लिए अपॉइंटमेंट बुक करें।",
      noMessages: "अभी तक कोई संदेश नहीं",
      emptyChatTitle: "एक बातचीत का चयन करें",
      emptyChatDesc: "साइडबार से एक बातचीत चुनें या अपॉइंटमेंट बुक करने के बाद नई शुरू करें",
      typing: "टाइप कर रहा है...",
      doctorRole: "डॉक्टर",
      typeMessage: "एक संदेश टाइप करें..."
    }
  },
  pa: {
    symptomChecker: {
      title: "AI ਲੱਛਣ ਚੈਕਰ",
      subtitle: "ਮੁੱਢਲੀ ਸਿਹਤ ਜਾਂਚ ਪ੍ਰਾਪਤ ਕਰਨ ਲਈ ਆਪਣੇ ਲੱਛਣਾਂ ਦਾ ਵਰਣਨ ਕਰੋ",
      step1: "ਲੱਛਣ",
      step2: "ਵੇਰਵੇ",
      step3: "ਨਤੀਜੇ",
      whatSymptoms: "ਤੁਸੀਂ ਕਿਹੜੇ ਲੱਛਣਾਂ ਦਾ ਅਨੁਭਵ ਕਰ ਰਹੇ ਹੋ?",
      selectAll: "ਜੋ ਵੀ ਲਾਗੂ ਹੋਵੇ ਉਸ ਨੂੰ ਚੁਣੋ:",
      selected: "ਚੁਣਿਆ ਗਿਆ:",
      next: "ਅਗਲਾ",
      aboutYou: "ਸਾਨੂੰ ਆਪਣੇ ਬਾਰੇ ਥੋੜ੍ਹਾ ਦੱਸੋ",
      age: "ਉਮਰ",
      agePlaceholder: "ਆਪਣੀ ਉਮਰ ਦਰਜ ਕਰੋ",
      gender: "ਲਿੰਗ",
      analyze: "🧠 ਲੱਛਣਾਂ ਦਾ ਵਿਸ਼ਲੇਸ਼ਣ ਕਰੋ",
      back: "ਵਾਪਸ",
      severity: "ਗੰਭੀਰਤਾ:",
      basedOn: "ਤੁਹਾਡੇ ਦੱਸੇ ਗਏ ਲੱਛਣਾਂ ਦੇ ਆਧਾਰ 'ਤੇ",
      conditions: "ਸੰਭਾਵਿਤ ਸਥਿਤੀਆਂ",
      recommendations: "ਸਿਫ਼ਾਰਿਸ਼ਾਂ",
      recommendedSpecialists: "ਸਿਫ਼ਾਰਿਸ਼ ਕੀਤੇ ਮਾਹਰ:",
      checkAgain: "ਦੁਬਾਰਾ ਜਾਂਚ ਕਰੋ",
      findDoctor: "ਡਾਕਟਰ ਲੱਭੋ",
      errSelect: "ਕਿਰਪਾ ਕਰਕੇ ਘੱਟੋ-ਘੱਟ ਇੱਕ ਲੱਛਣ ਚੁਣੋ",
      errFail: "ਵਿਸ਼ਲੇਸ਼ਣ ਅਸਫਲ ਰਿਹਾ। ਕਿਰਪਾ ਕਰਕੇ ਦੁਬਾਰਾ ਕੋਸ਼ਿਸ਼ ਕਰੋ।"
    },
    videoConsultation: {
      statusWaiting: "ਦੂਜੇ ਭਾਗੀਦਾਰ ਦੀ ਉਡੀਕ ਹੋ ਰਹੀ ਹੈ...",
      statusConnected: "ਜੁੜਿਆ ਹੋਇਆ",
      statusLeft: "ਭਾਗੀਦਾਰ ਚਲਾ ਗਿਆ",
      statusJoining: "ਭਾਗੀਦਾਰ ਜੁੜ ਗਿਆ - ਕਨੈਕਟ ਹੋ ਰਿਹਾ ਹੈ...",
      statusDenied: "ਕੈਮਰਾ/ਮਾਈਕ੍ਰੋਫੋਨ ਪਹੁੰਚ ਅਸਵੀਕਾਰ ਕੀਤੀ ਗਈ",
      statusUserLeft: "ਭਾਗੀਦਾਰ ਕਾਲ ਤੋਂ ਬਾਹਰ ਹੋ ਗਿਆ ਹੈ",
      unmute: "ਅਨਮਿਊਟ",
      mute: "ਮਿਊਟ",
      startVideo: "ਵੀਡੀਓ ਸ਼ੁਰੂ ਕਰੋ",
      stopVideo: "ਵੀਡੀਓ ਬੰਦ ਕਰੋ",
      endCall: "ਕਾਲ ਖਤਮ ਕਰੋ"
    },
    chat: {
      title: "ਸੁਨੇਹੇ",
      searchPlaceholder: "ਗੱਲਬਾਤ ਖੋਜੋ...",
      emptyConversations: "ਅਜੇ ਕੋਈ ਗੱਲਬਾਤ ਨਹੀਂ। ਡਾਕਟਰ ਨਾਲ ਚੈਟ ਸ਼ੁਰੂ ਕਰਨ ਲਈ ਅਪੌਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰੋ।",
      noMessages: "ਅਜੇ ਕੋਈ ਸੁਨੇਹਾ ਨਹੀਂ",
      emptyChatTitle: "ਇੱਕ ਗੱਲਬਾਤ ਚੁਣੋ",
      emptyChatDesc: "ਸਾਈਡਬਾਰ ਤੋਂ ਇੱਕ ਗੱਲਬਾਤ ਚੁਣੋ ਜਾਂ ਅਪੌਇੰਟਮੈਂਟ ਬੁੱਕ ਕਰਨ ਤੋਂ ਬਾਅਦ ਨਵੀਂ ਸ਼ੁਰੂ ਕਰੋ",
      typing: "ਟਾਈਪ ਕਰ ਰਿਹਾ ਹੈ...",
      doctorRole: "ਡਾਕਟਰ",
      typeMessage: "ਇੱਕ ਸੁਨੇਹਾ ਟਾਈਪ ਕਰੋ..."
    }
  }
};

['en', 'hi', 'pa'].forEach(lang => {
  const p = path.join(__dirname, 'src/locales', lang, 'translation.json');
  const data = JSON.parse(fs.readFileSync(p, 'utf8'));
  data.patient = { ...(data.patient || {}), ...translations[lang] };
  fs.writeFileSync(p, JSON.stringify(data, null, 2));
});
