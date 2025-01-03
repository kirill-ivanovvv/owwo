type CardContainerProps = {
  className?: string;
  children: JSX.Element | Array<JSX.Element>;
};

type CardContainerType = (props: CardContainerProps) => JSX.Element;

export type { CardContainerType };
