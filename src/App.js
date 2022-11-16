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
  ActivityIndicator,
} from "react-native";
import { Searchbar } from "react-native-paper";
import debounce from "lodash/debounce";
import PRIVATE_KEY from "./Constants";

const App = () => {
  const [isLoading, setLoading] = useState(true);
  const [isLoaderVisible, setIsLoaderVisible] = useState(false);
  const [data, setData] = useState([]);
  const [query, setQuery] = useState("");
  // const [page, setPage] = useState(0);
  const [totalCount, setTotalCount] = useState(-1);

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

  const loadData = (input) => {
    if (
      (totalCount - data.length > 0 ||
        (data.length == 0 && totalCount == -1)) &&
      !(data.length == totalCount)
    ) {
      fetch(
        `http://api.giphy.com/v1/gifs/search?q=${input}&api_key=${PRIVATE_KEY}&limit=${itemLimit}&offset=${data.length}`,
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
          setTotalCount(json.pagination.total_count);
          if (json?.data.length > 0) {
            setData([...data, ...json?.data]);
          }
        })
        .catch((error) => console.error(error))
        .finally(() => setLoading(false));
    } // Vai šeit nevajag else bloku gadījumam, kad vairs nav datu, ko ielādēt?
  };

  // #TODO: Nepushot Constants failu
  const handleSearch = useCallback(
    debounce((input = "") => {
      loadData(input);
    }, 300),
    []
  );

  const ShowLoader = () => {
    return isLoaderVisible ? (
      <ActivityIndicator size="small" color="#ff3b47" />
    ) : null;
  };

  const toggleLoader = () => {
    data.length !== totalCount
      ? setIsLoaderVisible(true)
      : setIsLoaderVisible(false);
  };

  useEffect(() => {
    handleSearch(query, [query]);
  }, [query]);

  return (
    <SafeAreaView style={styles.androidSafeArea}>
      <View style={{ flex: 1, paddingHorizontal: WINDOW_PADDING }}>
        {isLoading ? (
          <View style={styles.activityIndicator}>
            <ActivityIndicator size="large" color="#ff3b47" />
          </View>
        ) : (
          <View style={styles.topContainer}>
            <Text style={styles.title}>Chili's GIFs</Text>
            <Searchbar
              placeholder="Type your search here"
              onChangeText={handleChange}
              value={query}
              style={styles.searchBar}
            />

            <FlatList
              data={data}
              keyExtractor={(item) => item.id}
              numColumns={3}
              onEndReachedThreshold={0.5}
              ListFooterComponent={ShowLoader()}
              onEndReached={() => {
                loadData(query);
                toggleLoader();
              }}
              renderItem={({ item }) => (
                <Image
                  source={{
                    uri: item.images.preview_gif.url,
                  }}
                  style={{ width: gifSize, height: gifSize, margin: 2 }}
                />
              )}
            />
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
    fontSize: 18,
    color: "#010101",
    textAlign: "center",
    paddingTop: 30,
    paddingBottom: 10,
  },
  searchBar: {
    height: 40,
    marginBottom: 10,
  },
  // androidSafeArea view taken from: https://stackoverflow.com/questions/51289587/how-to-use-safeareaview-for-android-notch-devices
  androidSafeArea: {
    flex: 1,
    backgroundColor: "white",
    paddingTop: Platform.OS === "android" ? StatusBar.currentHeight : 0,
  },
  activityIndicator: {
    flex: 1,
    justifyContent: "center",
  },
});

export default App;
