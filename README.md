## expo-permission-config

  a plugin for `expo` based on `react-native-permission` (ios only);
  
## install

  ```shell
    yarn add expo-permission-config
  ```

## usage
  the demo
  ```js
    // app.json
    {
      // ... any config
      plugins: [
        [
          'expo-permission-config', 
          {
            permissions: [
              // the name of the permission you need to add
              // for example
              'Camera'
            ]
          }
        ]
      ]
      // ... any config
      
    }
  ```