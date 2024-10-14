import { Hr } from "@ui/hr";

import { ContentTextareaFieldset } from "./component-parts";
import { MainInputsFieldset } from "./component-parts";
import { FileInputFieldset } from "./component-parts";

// TODO
// в самом верху инпут, размером в одну строку, как на нижнем объекте (с
// возможностью просто добавть ссылку(external file)
//
// нужна возможность удалять файлы
//
//     render вложенных файлов в инпуте. получится сделать так, чтобы они
//     обображались прямо под курсором?
//
//     у каждого типа файла будет своя иконка. изображениe, текст, аудио, видео и
//     ссылка (например на другой файл)

const EditorForm = (props) => {
  const { node, client } = props;

  const {
    image: { original: imageSrc },
  } = node;

  const { isEditor } = client;

  return (
    <div class="grid editor-form">
      <Hr text="editor-form" color="var(--ORANGE)" />
      <MainInputsFieldset imageSrc={imageSrc} />
      <FileInputFieldset />
      <ContentTextareaFieldset />
      <Hr text="***" color="var(--ORANGE)" />
    </div>
  );
};

export { EditorForm };