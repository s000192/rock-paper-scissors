const Image = ({ src, ...props }: any) => {
  return <img alt="img" src={src} {...props} />;
};
export default Image;
