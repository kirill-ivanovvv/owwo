import type { TextareaType } from "./textarea.interface";

const Textarea: TextareaType = (props) => {
  const {
    id,
    name,
    rows = 8,
    text = "",
    required = false,
    placeholder = "",
  } = props;

  return (
    <p class="textarea__wrapper">
      <textarea
        class="textarea"
        id={id}
        spellcheck="false"
        name={name}
        placeholder={placeholder}
        rows={String(rows)}
        required={required}
      >
        {text}
      </textarea>
    </p>
  );
};

export { Textarea };