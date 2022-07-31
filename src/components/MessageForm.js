import React from "react";
import Attachment from "./svg/Attachment";

const MessageForm = ({ handleSubmit, handleOnChange, text, setText, setImg, progress }) => {
  return (
    <form className="message_form" onSubmit={handleSubmit}>
      <label htmlFor="img">
        <Attachment />
      </label>
      <input
        onChange=
        {handleOnChange}
        type="file" multiple
        //id="img"
        id="imginput"
        accept="image/*"
        //style={{ display: "none" }}
      />
      <div>
        <input
          type="text"
          placeholder="Enter message"
          value={text}
          onChange={(e) => setText(e.target.value)}
        />
      </div>
      <div>
        <button className="btn">Send</button>
      </div>
    </form>
  );
};

export default MessageForm;
