import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronDown } from '@carbon/icons-react';

interface NavDropdownProps {
  icon: React.ReactNode;
  title: string;
  link: string;
  isAdmin: boolean;
  withAuth: boolean;
  subLinks: Array<{
    label: string;
    to: string;
    adminOnly?: boolean;
  }>;
}

interface NavDropdownState {
  isOpen: boolean;
}

class NavDropdown extends React.Component<NavDropdownProps, NavDropdownState> {
  constructor(props: NavDropdownProps) {
    super(props);
    this.state = {
      isOpen: false,
    };
  }

  toggleDropdown = () => {
    this.setState((prevState) => ({
      isOpen: !prevState.isOpen,
    }));
  };

  render() {
    const { icon, title, link, isAdmin, withAuth, subLinks } = this.props;
    const { isOpen } = this.state;

    return (
      <div>
        <div className="dropdown-header">
          {icon}
          <Link to={link} className="dropbtn">
            {title}
          </Link>
          <ChevronDown
            className="icon_spacing_drop"
            onClick={this.toggleDropdown}
          />
        </div>
        {isOpen && (
          <div className="dropdown-content">
            {subLinks.map((subLink, index) => {
              if (subLink.adminOnly && !(isAdmin || !withAuth)) {
                return null;
              }
              return (
                <Link key={index} to={subLink.to} className="nav-link">
                  {subLink.label}
                </Link>
              );
            })}
          </div>
        )}
      </div>
    );
  }
}

export default NavDropdown;