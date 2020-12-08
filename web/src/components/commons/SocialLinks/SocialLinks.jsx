// imported from mlreef/www-mlreef-com
import React, { useMemo } from 'react';
import PropTypes from 'prop-types';
import './SocialLinks.scss';

const getTitle = () => document?.head.querySelector('title')?.text;

const SocialLinks = (props) => {
  const {
    url,
  } = props;

  const href = window?.location?.href;

  const redirectURL = useMemo(
    () => url || href,
    [url, href],
  );

  const generateURL = (baseUrl, params) => {
    const newURL = new URL(baseUrl);
    Object.entries(params).forEach((ps) => newURL.searchParams.append(...ps));

    return newURL.toString();
  };

  const twitterShare = useMemo(
    () => {
      const params = {
        original_referer: window && window.location.host,
        text: 'Check it out! ',
        hashtags: 'MLReef',
        url: redirectURL,
      };

      return generateURL('https://twitter.com/intent/tweet', params);
    },
    [redirectURL],
  );

  const linkedinShare = useMemo(
    () => {
      const params = {
        mini: true,
        url: redirectURL,
        title: getTitle() || '#MLReef',
        summary: 'ML MLOps',
        source: 'https://about.mlreef.com',
      };

      return generateURL('https://www.linkedin.com/sharing/share-offsite', params);
    },
    [redirectURL],
  );

  const whatsappShare = useMemo(
    () => `whatsapp://send?text=${redirectURL}`,
    [redirectURL],
  );

  const telegramShare = useMemo(
    () => {
      const params = {
        url: redirectURL,
        text: '#MLReef #MLOps',
      };

      return generateURL('https://t.me/share/url', params);
    },
    [redirectURL],
  );

  return (
    <div className="social-links">
      <div className="social-links-icons">
        <a
          rel="noopener noreferrer"
          aria-label="twitter icon"
          target="_blank"
          title="share with Twitter"
          href={twitterShare}
        >
          <img className="social-links-icon" src="/images/icons/tw.png" alt="twitter icon" />
        </a>
        <a
          rel="noopener noreferrer"
          aria-label="linkedin icon"
          target="_blank"
          title="share with Linkedin"
          href={linkedinShare}
        >
          <img className="social-links-icon" src="/images/icons/linkedin_active.svg" alt="linkedin icon" />
        </a>
        <a
          rel="noopener noreferrer"
          aria-label="whatsapp icon"
          target="_blank"
          title="share with Whatsapp"
          href={whatsappShare}
        >
          <img className="social-links-icon" src="/images/icons/ws.png" alt="whatsapp icon" />
        </a>

        <a
          rel="noopener noreferrer"
          aria-label="telegram icon"
          target="_blank"
          title="share with Telegram"
          href={telegramShare}
        >
          <img className="social-links-icon" src="/images/icons/telegram.png" alt="telegram icon" />
        </a>
      </div>
    </div>
  );
};

SocialLinks.defaultProps = {
  url: null,
};

SocialLinks.propTypes = {
  url: PropTypes.string,
};

export default SocialLinks;
