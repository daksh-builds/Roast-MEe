import { Innertube } from "youtubei.js";
import dotenv from "dotenv";
import ollama from 'ollama';
dotenv.config();

const Youtube_Cookie = process.env.YT_MUSIC_COOKIE;

async function getPersonalMusicLibrary() {
  try {
    // 1. Check if cookie exists
    if (!Youtube_Cookie) {
      throw new Error("YT_MUSIC_COOKIE is missing from .env");
    }

    // 2. Initialize YouTube Music client
    const yt = await Innertube.create({
      cookie: Youtube_Cookie,
    });

    console.log("Fetching personal library playlists...");

    // 3. Fetch personal music library
    const library = await yt.music.getLibrary();

    // 4. Extract items from library Grid
    const libraryItems =
      library.contents?.flatMap(
        //question mark will display undefined
        (section) => section.items ?? [],
      ) ?? [];

    // 5. Filter only playlists
    const playlists = libraryItems.filter(
      (item) => item.item_type === "playlist",
    );

    // 6. Check if playlists exist
    if (playlists.length === 0) {
      console.log("No playlists found in your YouTube Music library.");
      return;
    }

    console.log(`\nFound ${playlists.length} playlists!\n`);

    // 7. Display playlist information
    const myplaylist = await yt.getPlaylist(
      "VLPLhpjmTc7uJnZl46t5GdJ7sQfUe9Xvy4PB",
    );

   for (const item of myplaylist.items) {
    
    const titlestr=item.title?.text||item.title?.toString()||'Unknown title';
    let artistStr = 'Unknown Artist';
    
    if (item.author) {
        // If author is an object, look for .name or convert it to string
        artistStr = item.author.name || item.author.toString();
    } else if (item.artists && item.artists.length > 0) {
        // If it's an array of artists, grab the first one's name
        artistStr = item.artists[0].name || item.artists[0].toString();
    }
    console.log({

        title: titlestr,
        artist: artistStr
    
    });
}

    console.log("--------------------------------");
  } catch (error) {
    console.error("Failed to authenticate or fetch playlists:", error);
  }
}


export async function Mysongsofplaylist() {
  try {
    if (!Youtube_Cookie) {
      throw new Error("YT_MUSIC_COOKIE is missing");
    }

    const yt = await Innertube.create({
      cookie: Youtube_Cookie,
    });

    const myplaylist = await yt.getPlaylist("VLPLhpjmTc7uJnZl46t5GdJ7sQfUe9Xvy4PB");
  
    const songs = myplaylist.items.map((item) => {
      let artist = "Unknown Artist";

      if (item.author) {
        artist = item.author.name || item.author.toString();
      } else if (item.artists?.length) {
        artist = item.artists[0].name || item.artists[0].toString();
      }
      return {
        playlist: myplaylist.info.title,
        title: item.title?.text || item.title?.toString() || "Unknown Title",
        artist,
      };
    });


    return songs;

  } catch (error) {
    console.error(error);
    throw error;
  }
}

export async function RoasterLLM(songs) {

    try {
   if (!songs || songs.length === 0) {
      throw new Error("No songs provided to roast.");
    }

    const tracklistString = songs
      .map((song, index) => `${index + 1}. "${song.title}" by ${song.artist}`)
      .join('\n');

  const response = await ollama.chat({
    model: 'qwen3:8b', 
    think: false,
    messages: [
    {
  role: 'system',
  content: `You are a cynical, terminally online music snob with zero filter. Tear the user's playlist apart like you're roasting a stranger's Spotify Wrapped on Twitter. 

Rules:
- Be vicious, clever, and specific to the exact track titles and artists provided—never invent songs.
- Mock the contradictions in their taste (e.g., trying to look tough while listening to sad tracks).
- No polite compliments, no "at least you're consistent," and no fluff.`
}
,{
        role:'user',
          content: `Here is my playlist. Scan all of it and roast my overall music taste:\n\n${tracklistString}`
  }],
  });

  const result=response.message.content;
return result;
}catch(err){
console.log(err.message);
}
}

