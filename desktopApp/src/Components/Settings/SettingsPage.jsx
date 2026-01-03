import './SettingsPage.css'
import { MdArrowBackIosNew } from "react-icons/md";

const SettingsPage = ({ setSettingPage }) => {
  return (
    <div className='settingsPage-container'>
      <div className="settings-header"  onClick={() => setSettingPage(false)}>
        <button className='back-btn'>
          <MdArrowBackIosNew />
        </button>
        <p>Settings</p>
      </div>
    </div>
  );
};

export default SettingsPage;
