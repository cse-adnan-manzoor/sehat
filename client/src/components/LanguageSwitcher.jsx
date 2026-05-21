import { useTranslation } from 'react-i18next';
import './LanguageSwitcher.css';

export default function LanguageSwitcher() {
  const { i18n, t } = useTranslation();

  const changeLanguage = (e) => {
    i18n.changeLanguage(e.target.value);
  };

  return (
    <div className="language-switcher">
      <select 
        value={i18n.resolvedLanguage || 'en'} 
        onChange={changeLanguage}
        className="lang-select"
      >
        <option value="en">{t('language.en', 'English')}</option>
        <option value="hi">{t('language.hi', 'हिंदी')}</option>
        <option value="pa">{t('language.pa', 'ਪੰਜਾਬੀ')}</option>
      </select>
    </div>
  );
}
