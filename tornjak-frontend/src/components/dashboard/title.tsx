import React from 'react';
import PropTypes from 'prop-types';
import Typography from '@material-ui/core/Typography';

type TitleProps = {
  children: React.ReactNode
}

export default function Title(props: TitleProps) {
  return (
    <Typography component="h4" variant="h6" color="primary" gutterBottom>
      {props.children}
    </Typography>
  );
}

Title.propTypes = {
  children: PropTypes.node,
};