import { useState } from "react";
import { invoke } from "@tauri-apps/api/core";

export interface GraphQLType {
  kind: string;
  name: string;
  description?: string;
  fields?: GraphQLField[];
  inputFields?: GraphQLInputValue[];
  interfaces?: GraphQLTypeRef[];
  enumValues?: GraphQLEnumValue[];
  possibleTypes?: GraphQLTypeRef[];
}

export interface GraphQLField {
  name: string;
  description?: string;
  args: GraphQLInputValue[];
  type: GraphQLTypeRef;
  isDeprecated: boolean;
  deprecationReason?: string;
}

export interface GraphQLInputValue {
  name: string;
  description?: string;
  type: GraphQLTypeRef;
  defaultValue?: string;
}

export interface GraphQLTypeRef {
  kind: string;
  name?: string;
  ofType?: GraphQLTypeRef;
}

export interface GraphQLEnumValue {
  name: string;
  description?: string;
  isDeprecated: boolean;
  deprecationReason?: string;
}

export interface GraphQLSchema {
  queryType?: { name: string };
  mutationType?: { name: string };
  subscriptionType?: { name: string };
  types: GraphQLType[];
  directives: any[];
}

export const useIntrospection = () => {
  const [schema, setSchema] = useState<GraphQLSchema | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const runIntrospection = async (
    url: string,
    useBasicAuth: boolean = false,
    username: string = "",
    password: string = "",
    bearerToken: string = ""
  ) => {
    if (!url.trim()) {
      setError("URL is required for introspection");
      return;
    }

    setLoading(true);
    setError(null);

    try {
      let result: any;

      if (useBasicAuth && username) {
        result = await invoke("graphql_introspection_with_auth", {
          url,
          authType: "basic",
          username,
          password: password || "",
        });
      } else if (bearerToken.trim()) {
        result = await invoke("graphql_introspection_with_auth", {
          url,
          authType: "bearer",
          token: bearerToken,
        });
      } else {
        result = await invoke("graphql_introspection", { url });
      }

      if (result.success && result.data?.data?.__schema) {
        setSchema(result.data.data.__schema);
      } else if (result.data?.data?.errors) {
        setError(
          `GraphQL Error: ${
            result.data.data.errors[0]?.message || "Unknown error"
          }`
        );
      } else if (result.data?.errors) {
        setError(
          `GraphQL Error: ${result.data.errors[0]?.message || "Unknown error"}`
        );
      }
    } catch (err) {
      setError(
        err instanceof Error ? err.message : "An unknown error occurred"
      );
    } finally {
      setLoading(false);
    }
  };

  const clearSchema = () => {
    setSchema(null);
    setError(null);
  };

  const getType = (typeName: string): GraphQLType | undefined => {
    return schema?.types.find((type) => type.name === typeName);
  };

  const getQueryType = (): GraphQLType | undefined => {
    if (!schema?.queryType) return undefined;
    return getType(schema.queryType.name);
  };

  const getMutationType = (): GraphQLType | undefined => {
    if (!schema?.mutationType) return undefined;
    return getType(schema.mutationType.name);
  };

  const getSubscriptionType = (): GraphQLType | undefined => {
    if (!schema?.subscriptionType) return undefined;
    return getType(schema.subscriptionType.name);
  };

  return {
    schema,
    loading,
    error,
    runIntrospection,
    clearSchema,
    getType,
    getQueryType,
    getMutationType,
    getSubscriptionType,
  };
};
