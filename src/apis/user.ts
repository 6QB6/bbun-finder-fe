import api from "./interceptor";
import type { ProfileData, UserInfo } from "../types/interfaces";
import LocalStorageKeys from "../types/localstorage";


export const registerBbunUser = async () => {
    const idToken = localStorage.getItem(LocalStorageKeys.IdToken);
    if (!idToken) {
        throw new Error("Missing id_token");
    }
    return api
        .post(`/user`,{}, {
            headers: {
                Authorization: `Bearer ${idToken}`,
            },
        })
        .then(({ data }) => data);
};

export const getBbunUser = async (): Promise<UserInfo> => {
  return api.get<UserInfo>(`/user`).then(({ data }) => data);
};

export const updateBbunUser = async (profileData: ProfileData) => {
  return api.patch(`/user`, profileData).then(({ data }) => data);
};

export const withdrawBbunUser = async () => {
  return api.delete(`/user`).then(({ data }) => data);
};
