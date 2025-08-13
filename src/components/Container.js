const Container = ({ children }) => {

  const style = {
    direction: 'rtl',
    fontFamily: 'Arial, sans-serif',
    margin: 'auto',
    padding: 20,
    maxWidth: 960,
    maxHeight: '85dvh',
    backgroundColor: '#fff',
    color: '#333',
    boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
    borderRadius: 12,
  }
  return (
    <div style={style}>
      {children}
    </div>
  );
}

export default Container;