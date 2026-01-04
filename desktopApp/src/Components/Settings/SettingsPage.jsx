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
      <div className="settings-content-cont">
        <div className="settings-content-header">
          <p>Cloud Sync</p>
          <p>Sync your data across all devices</p>
        </div>
        
        <div className='settings-content'>

        </div>
      </div>
    </div>
  );
};

export default SettingsPage;
