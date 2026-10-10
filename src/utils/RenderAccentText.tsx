const RenderAccentText = ({ text }: { text: string }) => {
  const parts = text.split(/\*(.*?)\*/g);

  return (
    <>
      {parts.map((part, index) =>
        index % 2 === 1 ? (
          <span key={index} className="text-primary">
            {part}
          </span>
        ) : (
          part
        ),
      )}
    </>
  );
};

export default RenderAccentText;
