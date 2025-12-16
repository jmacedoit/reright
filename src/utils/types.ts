import { get } from "lodash";

type RecursiveProperties<T> = {
  [P in keyof T]: T[P] extends object ? RecursiveProperties<T[P]> : P;
};

// eslint-disable-next-line @typescript-eslint/no-explicit-any
function recursiveProperties(obj: any, prefix = ""): any {
  return new Proxy(
    {},
    {
      get: (_, prop: string) => {
        const path = prefix + (prefix !== "" ? "." : "") + prop;

        if (get(obj, path) instanceof Object) {
          return recursiveProperties(obj, path);
        }

        return path;
      },
      set: () => {
        throw new Error("Set not supported");
      },
    }
  );
}

export function propertiesLeaves<TObj>(obj?: TObj): RecursiveProperties<TObj> {
  return recursiveProperties(obj) as RecursiveProperties<TObj>;
}
