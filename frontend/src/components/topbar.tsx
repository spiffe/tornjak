import React from 'react';
import { useLocation } from 'react-router-dom';
const Topbar: React.FC = () => {
  const location = useLocation();
  const pathname = location.pathname;
  const formatPathnameToTitle = (pathname: string): string => {
    if (pathname === '/') {
      return 'Agents List';
    }
    const parts = pathname.replace(/^\/+|\/+$/g, '').split('/');
    const formattedParts = parts.map(part =>
      part.charAt(0).toUpperCase() + part.slice(1)
    );
    if (formattedParts.length === 0) {
      return 'Home';
    }
    return formattedParts.join(' ');
  };
  const title = formatPathnameToTitle(pathname);
  const numberOfShards = 200;
  const shardClasses = ['shard-green', 'shard-blue', 'shard-lightgreen'];
  const shards = Array.from({ length: numberOfShards }).map((_, index) => {
    const className = `shard ${shardClasses[index % shardClasses.length]}`;
    
    return <div key={index} className={className}></div>;
  });
  return (
    <div className="top-bar">
      <div className="shattered">
        {shards}
        <h1 className="title">{title}</h1>
      </div>
    </div>
  );
};
export default Topbar;