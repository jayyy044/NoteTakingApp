import React, { useState } from 'react';
import './Toolbar.css';
import { Dropdown } from 'antd';
import { IoChevronDownOutline } from "react-icons/io5";
import { BiText } from "react-icons/bi";
import { 
  MdFormatBold, 
  MdFormatItalic, 
  MdFormatUnderlined, 
  MdStrikethroughS,
  MdFormatColorText,
} from "react-icons/md";
import { 
  BsListUl, 
  BsListOl,
  BsTextLeft,
  BsTextCenter,
  BsTextRight,
  BsJustify
} from "react-icons/bs";
import { BiHighlight } from "react-icons/bi";

const Toolbar = ({ currentTool, onToolChange}) => {
  const [selectedTool, setSelectedTool] = useState('Tools');
  const [textColor, setTextColor] = useState('#000000');
  const [highlightColor, setHighlightColor] = useState('#ffffffff');

  const items = [
    {
      key: '1',
      label: 'Text',
    },
    {
      key: '2',
      label: 'Draw',
    },
  ];

  const themeColors = [
    ['#FFFFFF', '#000000', '#9CC3E5', '#5B9BD5', '#ED7D31', '#E74C3C', '#A5A552', '#C4B4D4', '#70AD47'],
    ['#F2F2F2', '#7F7F7F', '#D9E2F3', '#2E75B6', '#C55A11', '#C0392B', '#817F2E', '#8064A1', '#548235'],
    ['#D9D9D9', '#595959', '#B4C6E7', '#1F4E78', '#833C0B', '#943634', '#534E21', '#5B497B', '#375623'],
    ['#BFBFBF', '#3F3F3F', '#8EAADB', '#17375E', '#622D09', '#6A2C2B', '#3A3618', '#403558', '#28401A'],
    ['#A6A6A6', '#262626', '#2E5C8A', '#0F253C', '#411F06', '#4A1F1D', '#272410', '#2B2539', '#1A2912'],
  ];

  const standardColors = [
    '#C00000', '#FF0000', '#FFC000', '#FFFF00', '#92D050', '#00B050', 
    '#00B0F0', '#0070C0', '#002060', '#7030A0'
  ];

  const fontItems = [
    { key: 'arial', label: 'Arial' },
    { key: 'calibri', label: 'Calibri' },
    { key: 'times', label: 'Times New Roman' },
    { key: 'helvetica', label: 'Helvetica' },
  ];

  const sizeItems = [
    { key: '12', label: '12' },
    { key: '14', label: '14' },
    { key: '16', label: '16' },
    { key: '18', label: '18' },
    { key: '20', label: '20' },
    { key: '24', label: '24' },
  ];

  const handleMenuClick = (e) => {
    const selectedItem = items.find(item => item.key === e.key);
    if (selectedItem) {
      setSelectedTool(selectedItem.label);
    }
  };

  const ColorPicker = ({ colors, standardColors, onColorSelect, type }) => (
    <div className="color-picker">
      <div className="color-section">
        <div className="section-label">Theme Colors</div>
        <div className="theme-colors">
          {colors.map((row, rowIndex) => (
            <div key={rowIndex} className="color-row">
              {row.map((color, colIndex) => (
                <div
                  key={colIndex}
                  className="color-swatch"
                  style={{ backgroundColor: color }}
                  onClick={() => onColorSelect(color)}
                />
              ))}
            </div>
          ))}
        </div>
      </div>
      <div className="color-section">
        <div className="section-label">Standard Colors</div>
        <div className="standard-colors">
          {standardColors.map((color, index) => (
            <div
              key={index}
              className="color-swatch"
              style={{ backgroundColor: color }}
              onClick={() => onColorSelect(color)}
            />
          ))}
        </div>
      </div>
    </div>
  );

  const textColorMenu = {
    items: [{
      key: 'colorpicker',
      label: (
        <ColorPicker 
          colors={themeColors}
          standardColors={standardColors}
          onColorSelect={setTextColor}
          type="text"
        />
      ),
    }],
  };

  const highlightColorMenu = {
    items: [{
      key: 'colorpicker',
      label: (
        <ColorPicker 
          colors={themeColors}
          standardColors={standardColors}
          onColorSelect={setHighlightColor}
          type="highlight"
        />
      ),
    }],
  };

  // const handleToolChange = (tool) => {

  // }

  return (
    <div className='toolbar'>
      <div className="selectionbar">
        <Dropdown 
          menu={{ 
            items, 
            onClick: handleMenuClick 
          }}
          rootClassName="custom-dropdown"
          trigger={['click']}
        >
          <div className="toolbutton">
            {selectedTool}
            <IoChevronDownOutline style={{marginTop: '2px'}}/>
          </div>
        </Dropdown>
      </div>

      {selectedTool === 'Text' && (
        <div className="tools">
          {/* Font Family Dropdown */}
          <Dropdown 
            menu={{ items: fontItems }}
            rootClassName="custom-dropdown"
            trigger={['click']}
          >
            <div className="tool-dropdown">
              Calibri
              <IoChevronDownOutline size={12} />
            </div>
          </Dropdown>

          {/* Font Size Dropdown */}
          <Dropdown 
            menu={{ items: sizeItems }}
            rootClassName="custom-dropdown"
            trigger={['click']}
          >
            <div className="tool-dropdown" style={{marginLeft: '10px'}}>
              18
              <IoChevronDownOutline size={12} />
            </div>
          </Dropdown>

          <div className="tool-divider"></div>

          {/* Bold, Italic, Underline, Strikethrough */}
          <button className="tool-btn">
            <MdFormatBold size={30} />
          </button>
          <button className="tool-btn">
            <MdFormatItalic size={30} />
          </button>
          <button className="tool-btn">
            <MdFormatUnderlined size={30} />
          </button>
          <button className="tool-btn">
            <MdStrikethroughS size={30} />
          </button>

          <div className="tool-divider"></div>

          <Dropdown 
            menu={textColorMenu}
            rootClassName="color-dropdown"
            trigger={['click']}
          >
            <button className="tool-btn">
              <MdFormatColorText size={30} style={{ color: textColor }} />
            </button>
          </Dropdown>

          {/* Highlight Color with dropdown */}
          <Dropdown 
            menu={highlightColorMenu}
            rootClassName="color-dropdown"
            trigger={['click']}
          >
            <button className="tool-btn">
              <BiHighlight size={30} style={{ color: highlightColor }} />
            </button>
          </Dropdown>

          <div className="tool-divider"></div>

          {/* Bullets */}
          <button className="tool-btn">
            <BsListUl size={30} />
          </button>
          <button className="tool-btn">
            <BsListOl size={30} />
          </button>

          <div className="tool-divider"></div>

          {/* Text Alignment */}
          <button className="tool-btn">
            <BsTextLeft size={30} />
          </button>
          <button className="tool-btn">
            <BsTextCenter size={30} />
          </button>
          <button className="tool-btn">
            <BsTextRight size={30} />
          </button>
          <button className="tool-btn">
            <BsJustify size={30} />
          </button>

          <div className="tool-divider"></div>

          <button className="tool-btn" onClick={() => onToolChange('Text')}>
            <BiText size={30} />
          </button>
        </div>
      )}
    </div>
  );
};

export default Toolbar;