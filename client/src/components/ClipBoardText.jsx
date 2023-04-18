import { useEffect, useState } from "react";

import { CopyToClipboard } from "react-copy-to-clipboard";
import { Tooltip } from "antd";

export const ClipBoardText = ({ text }) => {
  const [isCopied, setIsCopied] = useState(false);
  const [hoverText, setHoverText] = useState("Copy");
  const [isHovering, setIsHovering] = useState(false);

  useEffect(() => {
    let timeout;
    let copyFunction = () => {
      setHoverText("Copied");

      timeout = setTimeout(() => {
        setHoverText("Copy");
        setIsCopied(false);
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
      <a
        style={{
          color: "#fe71d2",
          cursor: "pointer",
          textDecoration: "none",
        }}
        href={`https://bscscan.com/address/${text}`}
        target="_blank"
      >
        {text}
      </a>

      <Tooltip title={hoverText} color="#0f0f0f">
        <i
          className={isCopied ? "fa-solid fa-check" : "fa-regular fa-copy "}
          style={{
            color: isCopied ? "#70c841" : "#fe71d2",
            marginLeft: "5px",
            cursor: "pointer",
          }}
          onMouseEnter={() => setIsHovering(true)}
          onMouseLeave={() => setIsHovering(false)}
          onClick={() => {
            navigator.clipboard.writeText(text);
            setIsCopied(true);
          }}
        ></i>
      </Tooltip>
    </div>
  );
};
