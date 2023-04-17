import { useEffect, useState } from "react";

import { CopyToClipboard } from "react-copy-to-clipboard";

export const ClipBoardText = ({ text }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [hoverText, setHoverText] = useState("Copy to clipboard");

  useEffect(() => {
    let timeout;
    let copyFunction = () => {
      setIsCopied(true);
      setHoverText("Copied");

      timeout = setTimeout(() => {
        setIsCopied(false);
        setHoverText("Copy to clipboard");
      }, 2000);
    };

    if (isCopied) {
      copyFunction();
    }

    return () => {
      clearTimeout(timeout);
    };
  }, [isCopied]);

  return (
    <div className="clipboard">
      <CopyToClipboard text={text} onCopy={() => setIsCopied(true)} />
    </div>
  );
};
