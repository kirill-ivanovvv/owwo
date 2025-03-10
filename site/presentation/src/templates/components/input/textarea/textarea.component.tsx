import { CssModule } from "../../index.js";
import { TEXTAREA_CLASSNAME } from "./textarea.constants.js";
import { TEXTAREA_WRAPPER_CLASSNAME } from "./textarea.constants.js";
import type { TextareaProps } from "./textarea.interface.js";
import Style from "./textarea.module.css";

export const Textarea: Component<TextareaProps> = (props) => {
  const {
    id,
    name,
    // TODO - check
    // rows = 8,
    rows = "auto",
    text = "",
    required = false,
    placeholder = "",
  } = props;

  return (
    <>
      <p class={TEXTAREA_WRAPPER_CLASSNAME}>
        <textarea
          class={TEXTAREA_CLASSNAME}
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
      <CssModule filepath={Style} />
    </>
  );
};
