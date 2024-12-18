import { CssModule } from "@ui/css-module";

import type { DateComponentType } from "./date.interface";
import Style from "./date.module.css";

const DateComponent: DateComponentType = (props) => {
  const { date } = props;

  const localDate = date.last.toLocaleDateString("ru-RU");
  const localCreationDate = date.creation.toLocaleDateString("ru-RU");

  return (
    <>
      <div class="date-container">
        <h5 class="date_creation">{localCreationDate}</h5>
        <h6 class="date_last">{localDate}</h6>
      </div>
      <CssModule filepath={Style} />
    </>
  );
};

export { DateComponent };