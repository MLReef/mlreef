import { useRef, useState } from 'react';

export default () => {
  const [isDropdownOpen, setDropDownOpen] = useState(false);
  const dropDownRef = useRef();

  const handleBodyClick = (e) => {
    const clickedElement = document.elementFromPoint(e.clientX, e.clientY);
    if (!dropDownRef.current) return;
    if (!dropDownRef.current.contains(clickedElement)) {
      setDropDownOpen(false);
    }
  };

  const toggleShow = () => {
    const dropped = !isDropdownOpen;
    const bodyTag = document.body;
    if (dropped) {
      bodyTag.addEventListener('click', handleBodyClick);
    } else {
      bodyTag.removeEventListener('click', handleBodyClick);
    }
    setDropDownOpen(dropped);
  };

  return [dropDownRef, toggleShow, isDropdownOpen];
};
