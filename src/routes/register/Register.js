import React from 'react';
import PropTypes from 'prop-types';
import withStyles from 'isomorphic-style-loader/lib/withStyles';
import s from './Register.css';

const onSubmit = e => {
  e.preventDefault();

  return false;
};

class Register extends React.Component {
  static propTypes = {
    title: PropTypes.string.isRequired,
  };

  render() {
    return (
      <div className={s.root}>
        <div className={s.container}>
          <h1>
            {this.props.title}
          </h1>
          <form name="registerForm" id="registerForm" onSubmit={onSubmit}>
            <label htmlFor="email">Email</label>
            <input
              name="email"
              id="email"
              type="email"
              placeholder="jane.doe@email.com"
            />
          </form>
        </div>
      </div>
    );
  }
}

export default withStyles(s)(Register);
