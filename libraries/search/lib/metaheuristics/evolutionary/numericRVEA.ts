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
export class numericRVEA {
  public static adaptation(
    population: number[][],
    /* weights: number[][], */ weights_: number[][],
    M: number
  ) {
    const transposedPopulation: number[][] = numericRVEA.transpose(population);
    const z: number[] = [];
    for (
      let index = population.length - M;
      index < transposedPopulation.length;
      index++
    ) {
      const z_min = Math.min(...transposedPopulation[index]);
      const z_max = Math.max(...transposedPopulation[index]);
      z.push(z_max - z_min);
    }
    let weights: number[][] = weights_.map((individual) =>
      individual.map((element, index) => element * z[index])
    );
    const normalised: number[] = weights.map((individual) =>
      Math.sqrt(individual.reduce((x, y) => x + y ** 2, 0))
    );
    weights = weights.map((individual, index) =>
      individual.map((value) => value / normalised[index])
    );
    const neighbours = this.nearestNeighbors(weights);
    return { weights, neighbours };
  }

  public static selection(
    population: number[][],
    offspring: number[][],
    M: number,
    weights: number[][],
    neighbours: number[],
    alpha = 2,
    t: number,
    t_max: number
  ): number[][] {
    const output: number[][] = [];
    const f: number[][] = this.translation(population, offspring, M);
    const { arccosine, niche, individuals_norm } = this.populationPartition(
      weights,
      f
    );
    for (const [index, subpopulation] of niche.entries()) {
      if (subpopulation.length > 0) {
        let d_min = this.apd_d(
          f,
          arccosine,
          subpopulation[0],
          index,
          neighbours,
          M,
          t,
          t_max,
          alpha,
          individuals_norm
        );
        let d_min_index = subpopulation[0];
        for (const individaul of subpopulation) {
          const d = this.apd_d(
            f,
            arccosine,
            individaul,
            index,
            neighbours,
            M,
            t,
            t_max,
            alpha,
            individuals_norm
          );

          if (d < d_min) {
            d_min = d;
            d_min_index = individaul;
          }
        }
        console.log(d_min_index);
        output.push(population[d_min_index]);
      }
    }
    // console.log(output);
    // console.log(arccosine);
    // console.log(niche);
    // console.log(f);

    return output;
  }

  private static apd_d(
    f: number[][],
    arccosine: number[][],
    individaul: number,
    index: number,
    neighbours: number[],
    M: number,
    t: number,
    t_max: number,
    alpha: number,
    individuals_norm: number[]
  ): number {
    const arc_c_ind = arccosine[individaul][index] / neighbours[index];
    const p = M * Math.pow(t / t_max, alpha) * arc_c_ind;
    // TODO: Double check that I can use the normsOfIndividuals[individual] and that I do not need to recalculate it again.
    // const sum =  f[individaul].reduce((x, y) => x + y**2, 0);
    // const norm = Math.sqrt(sum);
    return (1 + p) * individuals_norm[individaul];
  }

  private static populationPartition(weights: number[][], f: number[][]) {
    // Stores the arccosine (angle) of each individual with respect to each reference vector. [ind1, ind2, ind3,...] where each ind is [angle1, angle2, ...].
    const arccosine: number[][] = [];

    const individuals_norm: number[] = [];
    // A map that represents the subpopulations. Each refernce vector get assigned certain individuals. Thus, an index of a reference vector is a key for a list of individuals represented as indexes.
    const niche: Map<number, number[]> = new Map<number, number[]>();
    // Initialisation of the map.
    for (const [index] of weights.entries()) {
      niche.set(index, []);
    }

    // TODO: Rewrite things through maps?
    // let individuals_norm_map =  f.map((individual) => {
    //     return Math.sqrt(individual.reduce((x, y) => x + y**2, 0));
    // } )

    // For each individual we need to calculate the angle to all reference vectors and find the smallest.
    for (const [individual_index, individual] of f.entries()) {
      // Calculate the norm (length) of an individual.
      const sum = individual.reduce((x, y) => x + y ** 2, 0);
      const norm = Math.sqrt(sum);
      individuals_norm.push(norm);

      // const individual_cosine: number[] = [];
      const individual_arccos: number[] = [];

      // Variables needed for finding the smallest angle (highest value of cos).
      let cosine_max =
        this.vectorMultiplication(individual, weights[0]) / (norm + 1e-21);
      let index_max = 0;

      // Loop that takes each individual and calculates the angle with each reference vector in the weights.
      for (const [index, referenceVector] of weights.entries()) {
        const cosine_value =
          this.vectorMultiplication(individual, referenceVector) /
          (norm + 1e-21);
        // individual_cosine.push(cosine_value);
        const clip_cosine_value = Math.max(Math.min(cosine_value, 1), 0);
        individual_arccos.push(Math.acos(clip_cosine_value));

        if (cosine_value > cosine_max) {
          cosine_max = cosine_value;
          index_max = index;
        }
      }

      // Update niche
      const sub_population = niche.get(index_max);
      sub_population.push(individual_index);
      niche.set(index_max, sub_population);

      arccosine.push(individual_arccos);
    }
    return { arccosine, niche, individuals_norm };
  }

  /**
   * We are subtracting z_min only from the last M columns because those are the randomly generated variables from our objective function (list_of_functions).
   * The first M values in the array are used to randomly generate range from min to max values to be used to randomly generate the initial population.
   * @param population
   * @param offspring
   * @param M
   * @private
   */
  private static translation(
    population: number[][],
    offspring: number[][],
    M: number
  ): number[][] {
    population.push(...offspring);
    const transposedPopulation: number[][] = numericRVEA.transpose(population);
    const z_min: number[] = [];
    for (
      let index = transposedPopulation.length - M;
      index < transposedPopulation.length;
      index++
    ) {
      z_min.push(Math.min(...transposedPopulation[index]));
    }
    for (
      let index = transposedPopulation.length - M;
      index < transposedPopulation.length;
      index++
    ) {
      for (const [position, number] of transposedPopulation[index].entries())
        transposedPopulation[index][position] = number - z_min[index];
    }
    return numericRVEA.transpose(transposedPopulation);
  }

  public static nearestNeighbors(referenceVectors: number[][]): number[] {
    const output: number[] = [];

    for (const vector1 of referenceVectors) {
      const sortedCosine: number[] = [];
      for (const vector2 of referenceVectors) {
        sortedCosine.push(-1 * this.vectorMultiplication(vector1, vector2));
      }
      sortedCosine.sort((a, b) => a - b);
      const clipVector: number = Math.max(Math.min(-1 * sortedCosine[1], 1), 0);
      output.push(Math.acos(clipVector));
    }
    return output;
  }

  private static vectorMultiplication(v1: number[], v2: number[]): number {
    // TODO: Check that the vectors are of the same size.
    let sum = 0;
    for (const [index, element] of v1.entries()) {
      sum += element * v2[index];
    }
    return sum;
  }

  // Source: https://github.com/Valdecy/pyMultiobjective/blob/0c72fc293726d76352d51875374f2327aa6d122b/pyMultiobjective/algorithm/rvea.py
  public static referenceVectors(referencePoints: number[][]): number[][] {
    const output: number[][] = [];
    let sum = 0;
    for (const vector of referencePoints) {
      for (const element of vector) {
        sum += Math.pow(Math.abs(element), 2);
      }
    }
    sum = Math.sqrt(sum);
    for (const vector of referencePoints) {
      const unitVector: number[] = [];
      for (const element of vector) {
        unitVector.push(element / sum);
      }
      output.push(unitVector);
    }
    return output;
  }

  // Source: https://github.com/Valdecy/pyMultiobjective/blob/0c72fc293726d76352d51875374f2327aa6d122b/pyMultiobjective/algorithm/rvea.py
  public static referencePoints(M: number, p: number): number[][] {
    return numericRVEA.referencePointsGenerator([], M, p, p, 0);
  }

  // Source: https://github.com/Valdecy/pyMultiobjective/blob/0c72fc293726d76352d51875374f2327aa6d122b/pyMultiobjective/algorithm/rvea.py
  public static referencePointsGenerator(
    r_points: number[],
    M: number,
    Q: number,
    T: number,
    D: number
  ): number[][] {
    const points: number[][] = [];
    if (D === M - 1) {
      r_points[D] = Q / T;
      points.push(r_points);
    } else if (D !== M - 1) {
      for (let index = 0; index <= Q; index++) {
        r_points[D] = index / T;
        points.push(
          ...numericRVEA.referencePointsGenerator(
            [...r_points],
            M,
            Q - index,
            T,
            D + 1
          )
        );
      }
    }
    return points;
  }

  // Source: https://stackoverflow.com/questions/17428587/transposing-a-2d-array-in-javascript
  private static transpose(matrix: number[][]): number[][] {
    const rows = matrix.length;
    const cols = matrix[0].length;
    const grid: number[][] = [];
    for (let index = 0; index < cols; index++) {
      grid[index] = [];
    }
    for (let index = 0; index < rows; index++) {
      for (let index_ = 0; index_ < cols; index_++) {
        grid[index_][index] = matrix[index][index_];
      }
    }
    return grid;
  }
}
