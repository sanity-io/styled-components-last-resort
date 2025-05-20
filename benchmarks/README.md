# benchmarks

Try the [benchmarks app](https://necolas.github.io/react-native-web/benchmarks) online.

To run the benchmarks locally:

```sh
yarn benchmarks
open ./packages/benchmarks/dist/index.html
```

Develop against these benchmarks:

```sh
yarn compile --watch
yarn benchmarks --watch
```

## Notes

These benchmarks are approximations of extreme cases that libraries may
encounter. Their purpose is to provide an early-warning signal for performance
regressions. Each test report includes the mean and standard deviation of the
timings, and approximations of the time spent in scripting (S) and layout (L).

The components used in the render benchmarks are simple enough to be
implemented by multiple UI or style libraries. The benchmark implementations
and the features of the style libraries are _only approximately equivalent in
functionality_.

No benchmark will run for more than 20 seconds.

### Mount deep/wide tree

These cases look at the performance of mounting and rendering large trees of
elements that use static styles.

### Update dynamic styles

This case looks at the performance of repeated style updates to a large mounted
tree. Some libraries choose to inject new styles for each "dynamic style",
whereas others choose to use inline styles. Libraries without built-in support
for dynamic styles (i.e., they rely on user-authored inline styles) are not
included.

## Example results

### MacBook Pro (2011)

MacBook Pro (13-inch, Early 2011); 2.3 GHz Intel Core i5; 8 GB 1333 MHz DDR3 RAM. Google Chrome 63.

Typical render timings: mean ± standard deviations.

| Implementation           | Mount deep tree (ms) | Mount wide tree (ms) | Dynamic update (ms) |
| :----------------------- | -------------------: | -------------------: | ------------------: |
| `css-modules`            |     `30.19` `±04.84` |     `38.25` `±04.85` |                   - |
| `react-native-web@0.4.0` |     `36.40` `±04.98` |     `51.28` `±05.58` |    `19.36` `±02.56` |
| `inline-styles`          |     `64.12` `±07.69` |     `94.49` `±11.34` |    `09.84` `±02.36` |

### Moto G4

Moto G4 (Android 7); Octa-core (4x1.5 GHz & 4x1.2 Ghz); 2 GB RAM. Google Chrome 63.

Typical render timings: mean ± standard deviations.

| Implementation           | Mount deep tree (ms) | Mount wide tree (ms) | Dynamic update (ms) |
| :----------------------- | -------------------: | -------------------: | ------------------: |
| `css-modules`            |     `98.24` `±20.26` |    `143.75` `±25.50` |                   - |
| `react-native-web@0.4.0` |    `131.46` `±18.96` |    `174.70` `±14.88` |    `60.87` `±06.32` |
| `inline-styles`          |    `184.58` `±26.23` |    `273.86` `±26.23` |    `30.28` `±07.44` |

### MacBook Pro (2025)

MacBook Pro (16-inch, Late 2024); 16-core M4 Max; 128 GB LPDDR5 RAM. Google Chrome 131.

Typical render timings: mean ± standard deviations.

| Implementation             | Mount deep tree (ms) | Mount wide tree (ms) | Update dynamic styles (ms) |
| :------------------------- | -------------------: | -------------------: | -------------------------: |
| `aphrodite`                |       `02.41 ±00.75` |       `02.68 ±00.10` |             `00.91 ±00.38` |
| `emotion`                  |       `03.29 ±00.71` |       `04.66 ±00.81` |             `01.95 ±00.67` |
| `goober`                   |       `02.90 ±00.67` |       `03.59 ±00.11` |           `746.07 ±435.17` |
| `inline-styles`            |       `03.72 ±00.20` |       `05.35 ±00.15` |             `01.24 ±00.37` |
| `react-native-web`         |       `03.15 ±00.27` |       `04.65 ±00.43` |             `01.33 ±00.18` |
| `styled-components-object` |       `02.89 ±00.59` |       `03.81 ±00.24` |                          - |
| `styled-components-v5`     |       `02.60 ±00.57` |       `03.31 ±00.15` |             `01.81 ±00.56` |
| `styled-components-v6`     |       `02.33 ±00.11` |       `03.13 ±00.12` |             `01.54 ±00.51` |
| `styled-components`        |       `02.30 ±00.28` |       `03.08 ±00.13` |             `01.02 ±00.31` |
| `styled-jsx`               |       `03.11 ±00.33` |       `05.01 ±00.59` |             `01.67 ±00.58` |
| `styletron-react`          |       `03.20 ±00.24` |       `04.40 ±00.16` |             `01.89 ±00.62` |

After upgrading to React 19 and using ReactDOM.createRoot, refactoring away from class components, and enabling React Compiler:

| Implementation                           | Mount deep tree (ms) | Mount wide tree (ms) | Update dynamic styles (ms) |
| :--------------------------------------- | -------------------: | -------------------: | -------------------------: |
| `aphrodite`                              |       `02.54 ±00.74` |       `02.60 ±00.47` |             `00.72 ±00.22` |
| `css-modules`                            |       `02.50 ±00.79` |       `02.65 ±00.61` |             `00.97 ±00.34` |
| `emotion`                                |       `03.06 ±00.46` |       `04.02 ±00.17` |             `00.96 ±00.31` |
| `goober`                                 |       `02.94 ±00.70` |       `03.39 ±00.17` |           `875.90 ±507.63` |
| `inline-styles`                          |       `03.36 ±00.18` |       `04.62 ±00.15` |             `00.70 ±00.22` |
| `react-native-web`                       |       `03.17 ±00.40` |       `04.24 ±00.43` |             `00.91 ±00.39` |
| `restyle`                                |       `13.49 ±01.37` |       `21.07 ±00.99` |             `01.95 ±01.04` |
| `styled-components-object`               |       `02.93 ±00.52` |       `04.38 ±00.34` |             `01.01 ±00.33` |
| `styled-components-use-insertion-effect` |       `02.50 ±00.76` |       `02.85 ±00.15` |             `00.79 ±00.23` |
| `styled-components-v5`                   |       `02.65 ±00.75` |       `03.30 ±00.17` |             `00.82 ±00.30` |
| `styled-components-v6`                   |       `02.50 ±00.72` |       `02.77 ±00.25` |             `00.79 ±00.27` |
| `styled-components`                      |       `02.45 ±00.61` |       `03.04 ±00.27` |             `00.73 ±00.31` |
| `styled-jsx`                             |       `02.83 ±00.47` |       `04.32 ±00.45` |             `00.85 ±00.25` |
| `styletron-react`                        |       `03.02 ±00.63` |       `04.94 ±00.15` |             `02.12 ±01.00` |
