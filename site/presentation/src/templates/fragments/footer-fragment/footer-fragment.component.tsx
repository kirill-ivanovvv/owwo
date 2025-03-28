import { CssModule } from "../../components/index.js";
import { Hr } from "../../components/index.js";
import Style from "./footer-fragment.module.css";

const ABOUT_ROUTE_PATH = "about";

export const FooterFragment = () => {
  return (
    <>
      <footer class="grid footer">
        <Hr text="footer" />

        <h5>
          <a href={ABOUT_ROUTE_PATH}>о проекте</a>
        </h5>
      </footer>

      <CssModule filepath={Style} />
    </>
  );
};
