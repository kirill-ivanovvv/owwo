const Hr = (props) => {
  const { text, color } = props;
  const colorStyle = color ? `color: ${color}; border-color: ${color};` : "";

  if (text) {
    return (
      <fieldset style={colorStyle}>
        <legend>
          <h6>{text}</h6>
        </legend>
      </fieldset>
    );
  }

  return <hr />;
};

export { Hr };
