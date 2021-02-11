import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

const replacePlaceholers = (info) => ({ regex, placeholders }) => {
  const reducePlaceholders = (re, ph) => re.replace(`:${ph}`, info[ph]);

  return (placeholders || []).reduce(reducePlaceholders, regex);
};

const execTimeout = (condition, callback, options) => {
  if (options.done) return;
  // passing values in parameters for the clearTimeout function
  // eslint-disable-next-line
  options.id = setTimeout(() => {
    if (condition()) {
      // eslint-disable-next-line
      options.done = true;
      callback();
    } else {
      execTimeout(condition, callback, options);
    }
  }, 2000);
};

const useValidators = (validators, callback, info = {}) => {
  const location = useLocation();

  useEffect(
    () => {
      const deactivatings = [];
      // console.log(location.pathname);
      validators.forEach((validator) => {
        if (validator.type === 'urlChecker') {
          if (validator.condition) {
            if (location.pathname === validator.condition) callback();
          }

          if (validator.regex) {
            const replacedRegex = replacePlaceholers(info)(validator);
            // console.log('replacedRegex', replacedRegex);
            const re = new RegExp(replacedRegex);
            if (re.test(location.pathname)) callback();
          }
        }

        if (validator.type === 'hashChecker') {
          if (validator.regex) {
            const replacedRegex = replacePlaceholers(info)(validator);
            const re = new RegExp(replacedRegex);
            if (re.test(location.hash)) callback();
          }
        }

        if (validator.type === 'clickListener') {
          const button = document.querySelector(validator.selector);

          if (button) {
            button.addEventListener('click', callback);

            deactivatings.push(() => button.removeEventListener('click', callback));
          }
        }

        if (validator.type === 'presence') {
          if (document.querySelector(validator.preSelector)) {
            const condition = () => document.querySelector(validator.postSelector);
            const options = { done: false, id: null };
            execTimeout(condition, callback, options);

            deactivatings.push(() => clearTimeout(options.id));
          }
        }

        return () => deactivatings.forEach((fn) => fn());
      });
    },
    [location, validators, callback, info],
  );
};

export default {
  useValidators,
};
