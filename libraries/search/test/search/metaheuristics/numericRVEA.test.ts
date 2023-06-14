/*
 * Copyright 2020-2023 Delft University of Technology and SynTest contributors
 *
 * This file is part of SynTest Framework - SynTest Core.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *     http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

import { numericRVEA } from "../../../lib/metaheuristics/evolutionary/numericRVEA";

describe("Numeric RVEAMOSA", function () {
  it("Test Reference Vector Generation", () => {
    // console.log(numericRVEA.referenceVectors(numericRVEA.referencePoints(2, 5)));
    // console.log(numericRVEA.nearestNeighbors(numericRVEA.referenceVectors(numericRVEA.referencePoints(2, 5))));
    // console.log(numericRVEA.nearestNeighbors([[0,1],[1,0],[1/Math.sqrt(2), 1/Math.sqrt(2)]]));

    // numericRVEA.selection([[1,0], [0,1]],[[1,1], [2,3]], 2, [[1,0],[0,1]], [0], 2, 0, 50);
    // numericRVEA.selection([[1,2,3,4], [5,6,7,8]],[[9,10,11,12], [13,14,15,16]], 2, [[1,1,1,1],[1,1,1,1]], [1,1,1,1,1,1], 2, 0, 50);
    // TODO: Make sure that division by 0 does not happen. Put an assertion or add an epsilon?
    const population = [
      [0.3528, 0.406],
      [0.4137, 0.3568],
    ];
    const neighbours = [1.388, 1.4156, 1.4432, 1.4432, 1.4156, 1.388];
    const offspring = [
      [0.4218, 0.3506],
      [0.4206, 0.3515],
      [0.35, 0.4084],
      [0.4052, 0.3635],
      [0.3587, 0.4011],
      [0.4085, 0.3609],
      [0.3597, 0.4003],
      [0.5809, 0.2378],
      [0.408, 0.3613],
      [0.3562, 0.4032],
      [0.4037, 0.3647],
      [0.4728, 0.3124],
      [0.3978, 0.3693],
      [0.4165, 0.3546],
      [0.4374, 0.3386],
      [0.3557, 0.4036],
      [0.4052, 0.3635],
      [0.358, 0.4017],
      [0.411, 0.3589],
      [0.3458, 0.412],
      [0.4477, 0.3309],
      [0.3047, 0.448],
      [0.4119, 0.3582],
      [0.155, 0.6063],
    ];
    const weights = [
      [0, 0.4767],
      [0.0953, 0.3814],
      [0.1907, 0.286],
      [0.286, 0.1907],
      [0.3814, 0.0953],
      [0.4767, 0],
    ];
    console.log(
      numericRVEA.selection(
        population,
        offspring,
        2,
        weights,
        neighbours,
        2,
        1,
        50
      )
    );
    // assert that [ [ 0.3047, 0.448 ], [ 0.3458, 0.412 ] ]
    // console.log(numericRVEA.adaptation([[1,2,3,4],[5,6,7,8]], [[1,2],[3,4],[5,6],[7,8],[9,10],[11,12]], 2));
  });

  it("Test Generation 49", () => {
    const population = [
      [0.005, 0.9293],
      [0.1192, 0.6548],
      [0.2452, 0.5048],
      [0.4037, 0.3646],
      [0.6164, 0.2149],
      [1, 0],
    ];
    const neighbours = [0.1813, 0.1813, 0.2734, 0.3783, 0.3286, 0.3286];
    const offspring = [
      [0.0152, 0.8767],
      [0.6464, 0.196],
      [0, 1],
      [0.4164, 0.3547],
      [0.1984, 0.5545],
      [0.5948, 0.2288],
      [0.0215, 0.8534],
      [0, 1],
      [0.2461, 0.5039],
      [0.2247, 0.526],
      [0, 1],
      [0.2884, 0.4629],
      [0.221, 0.5299],
      [0.3722, 0.3899],
      [0.4141, 0.3565],
      [0.1004, 0.6832],
      [0, 1],
      [0.368, 0.3934],
      [0.0287, 0.8305],
      [0.2747, 0.4759],
      [0.5701, 0.245],
      [0.2249, 0.5257],
      [0.3257, 0.4293],
      [0.1517, 0.6105],
    ];
    const weights = [
      [0, 1],
      [0.1803, 0.9836],
      [0.4392, 0.8984],
      [0.7399, 0.6727],
      [0.9465, 0.3227],
      [1, 0],
    ];
    console.log(
      numericRVEA.selection(
        population,
        offspring,
        2,
        weights,
        neighbours,
        2,
        1,
        50
      )
    );
  });

  it("Test Reference Vector Generation", () => {
    console.log(
      numericRVEA.referenceVectors(numericRVEA.referencePoints(2, 5))
    );
  });
});
