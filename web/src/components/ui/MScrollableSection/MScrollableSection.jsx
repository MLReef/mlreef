import React, { useEffect, useRef } from 'react';
import PropTypes, { any } from 'prop-types';

const MScrollableSection = ({
  children, handleOnScrollDown, className,
}) => {
  const containerRef = useRef();

  useEffect(() => {
    const onScrollCallback = () => {
      const windowHeight = window.innerHeight;
      const { body } = document;
      const html = document.documentElement;
      const docHeight = Math.max(
        body.scrollHeight,
        body.offsetHeight,
        html.clientHeight,
        html.scrollHeight,
        html.offsetHeight,
      );
      const windowBottom = windowHeight + window.pageYOffset;
      if (windowBottom + 150 >= docHeight) {
        handleOnScrollDown();
      }
    };
    window.addEventListener('scroll', onScrollCallback);

    return () => window.removeEventListener('scroll', onScrollCallback);
  }, [handleOnScrollDown]); // never remove handleOnScrollDown again from deps

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
