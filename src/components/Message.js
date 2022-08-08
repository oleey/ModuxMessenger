import React, { useRef, useEffect } from "react";
import Moment from "react-moment";
//import * as FileSystem from 'expo-file-system';

const Message = ({ msg, user1, urls }) => {
  const scrollRef = useRef();

  //const uri = msg.media;

  //const Download = async (uri) => {
 //   const downloadInstance = FileSystem.createDownloadResumable(
  //    uri,
  //    FileSystem.documentDirectory + "image.jpg"
   // );
  
   // const result = await FileSystem.downloadInstance.downloadAsync();

   // const asset = await MediaLibrary.createAssetAsync(result.uri);

//MediaLibrary.createAlbumAsync("ModuxMessenger", asset, false)
 //  .then(() => console.log('File Saved Successfully'))
 //  .catch(() => console.log('Error in saving file'));
  //}



  useEffect(() => {
    scrollRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [msg]);
  return (
    <div
      className={`message_wrapper ${msg.from === user1 ? "own" : ""}`}
      ref={scrollRef}
    >
      <p className={msg.from === user1 ? "me" : "friend"}>
        {msg.media ? <img src={msg.media} alt={msg.text}
       // onClick={() => (Download
//) }
        //onClick=()=>{urls}
        /> : null}
        {msg.text}
        <br />
        <small>
          <Moment fromNow>{msg.createdAt.toDate()}</Moment>
        </small>
      </p>
    </div>
  );
};

export default Message;
