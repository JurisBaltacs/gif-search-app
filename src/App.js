import React, { useEffect, useState, useCallback } from "react";
import {
  FlatList,
  Text,
  View,
  Image,
  StyleSheet,
  useWindowDimensions,
  Platform,
  StatusBar,
  SafeAreaView,
} from "react-native";
import { Searchbar } from "react-native-paper";
import debounce from "lodash/debounce";
import PRIVATE_KEY from "./Constants";

const App = () => {
  const [isLoading, setLoading] = useState(true);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  const [page, setPage] = useState(0);

  useEffect(() => {
    setData([]);
  }, [query]);

  const WINDOW_PADDING = 10;
  const windowWidth = useWindowDimensions().width;
  const gifSize = (windowWidth - WINDOW_PADDING * 2) / 3;
  const itemLimit = 20;

  const handleChange = (input) => {
    setQuery(input);
  };

  const loadData = (input, page) => {
    setIsLoadingMore(true);
    offset = itemLimit * page;

    fetch(
      `http://api.giphy.com/v1/gifs/search?q=${input}&api_key=${PRIVATE_KEY}&limit=${itemLimit}&offset=${offset}`,
      {
        method: "GET",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
        },
      }
    )
      .then((response) => response.json())
      .then((json) => {
        if (json?.data.length > 0) setData([...data, ...json?.data]); // Vai šis if jau nenohandlo situāciju, kur data array nav jāpapildina?
      })
      .catch((error) => console.error(error))
      .finally(() => setLoading(false), setPage(page + 1));
  };

  // #TODO: Nepushot Constants failu
  const handleSearch = useCallback(
    debounce((input = "") => {
      loadData(input, page);
    }, 300),
    []
  );

  // const LoadMoreGifs = () => {
  //   return isLoading ? <Text>Loading more GIFs...</Text> : null;
  // };

  useEffect(() => {
    handleSearch(query, [query]);
  }, [query]);

  // console.log("data being displayed:", data);
  return (
    <SafeAreaView style={styles.AndroidSafeArea}>
      <View style={{ flex: 1, paddingHorizontal: WINDOW_PADDING }}>
        {isLoading ? (
          <Text>Loading...</Text>
        ) : (
          <View style={styles.topContainer}>
            <Text style={styles.title}>Chili GIFs:</Text>
            <Searchbar
              placeholder="Type your search here"
              onChangeText={handleChange}
              value={query}
              style={styles.searchBar}

              // #TODO: ieviest onSend. Tagad nekas nenotiek.
            />

            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              numColumns={3}
              onEndReachedThreshold={0.5}
              onEndReached={() => {
                loadData(query, page, offset);
              }}
              // ListFooterComponent={LoadMoreGifs}
              renderItem={({ item }) => (
                <Image
                  source={{
                    uri: item.images.preview_gif.url,
                  }}
                  style={{ width: gifSize, height: gifSize, margin: 2 }}
                  // #TODO: pielikt border top
                />
              )}
            />
            <View>{isLoading ? <Text>Loading more GIFs...</Text> : null}</View>
          </View>
        )}
      </View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  topContainer: {
    flex: 1,
    flexDirection: "column",
  },
  title: {
    fontSize: 14,
    color: "#010101",
    textAlign: "center",
    paddingTop: 30,
    paddingBottom: 10,
  },
  searchBar: {
    height: 40,
    marginBottom: 10,
  },
  // AndroidSafeArea view taken from: https://stackoverflow.com/questions/51289587/how-to-use-safeareaview-for-android-notch-devices
  AndroidSafeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
});

export default App;
