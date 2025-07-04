const ActionButton = ({ onAction, children, ...props }) => (
    <button
      onClick={onAction}
      onContextMenu={(e) => {
        e.preventDefault(); // Արգելում ենք աջ կոճակի menu-ն
        // onAction() այստեղ չկանչենք, միայն ձախ կոճակի համար թողնենք
      }}
      {...props}
    >
      {children}
    </button>
  );
  