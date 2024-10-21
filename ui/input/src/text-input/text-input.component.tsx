import { CssModule } from "@ui/css-module";

import type { TextInputType } from "./text-input.interface";
import Style from "./text-input.style.css";

// TODO whats wrong with autocapitalize? maybe do declaration?

const TextInput: TextInputType = (props) => {
  const { id, name, type = "text", required = false, placeholder = "" } = props;
  return (
    <>
      <p class="text-input__wrapper">
        <input
          class="text-input"
          autocomplete="off"
          autocapitalize="off"
          required={required}
          id={id}
          name={name}
          placeholder={placeholder}
          type={type}
        />
      </p>
      <CssModule filepath={Style} />
    </>
  );
};

export { TextInput };
