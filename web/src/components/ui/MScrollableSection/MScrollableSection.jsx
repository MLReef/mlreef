import React, { useEffect, useRef } from 'react';
import PropTypes, { any } from 'prop-types';

const MScrollableSection = ({
  children, handleOnScrollDown, className,
}) => {
  const containerRef = useRef();

  useEffect(() => {
    const onScrollCallback = () => {
      const lastEle = containerRef.current?.lastChild;
      const lastEleOffSet = lastEle?.offsetTop + lastEle?.clientHeight;
      const pageOffset = window.pageYOffset + window.innerHeight;
      const bottomOffset = 200;
      if (pageOffset > lastEleOffSet - bottomOffset) handleOnScrollDown();
    };
    window.addEventListener('scroll', onScrollCallback);

    return () => window.removeEventListener('scroll', onScrollCallback);
  }, []);

  return (
    <div ref={containerRef} className={className}>
      {children}
    </div>
  );
};

MScrollableSection.propTypes = {
  children: any,
  handleOnScrollDown: PropTypes.func.isRequired,
  className: PropTypes.string,
};

MScrollableSection.defaultProps = {
  className: '',
};

export default MScrollableSection;
