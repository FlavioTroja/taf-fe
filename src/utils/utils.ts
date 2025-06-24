import { isArray, isEqual, isObject, transform } from 'lodash-es';
import { DateTime } from "luxon";
import { Sort } from "../app/models/Table";
import { Roles, User } from "../app/models/User";

function changes(newObj: any, origObj: any) {
  let arrayIndexCounter = 0
  return transform(newObj, function (result: any, value, key) {
    if (!isEqual(value, origObj[key])) {
      let resultKey = isArray(origObj) ? arrayIndexCounter++ : key
      result[resultKey] = (isObject(value) && isObject(origObj[key])) ? changes(value, origObj[key]) : value
    }
  })
}

export function difference(origObj: any, newObj: any) {
  return changes(newObj, origObj)
}

export function createORQuery(noActionColumns: string[], searchText: string) {
  if (!searchText) {
    return {}
  }
  return {
    OR: noActionColumns.map(searchColumn => ({
      [searchColumn]: { contains: (searchText), mode: "insensitive" },
    }))
  }
}

export function createSortArray(arr: Sort[]) {
  return arr.map(({ active, direction }) => ({
    [active]: direction
  }));
}

export function formatDate(date: string) {
  return DateTime.fromISO(date).setLocale("it").toLocaleString({ month: "long", day: "numeric", year: "numeric" });
}

export function formatDateWithHour(date: string) {
  return DateTime.fromISO(date).setLocale("it").toLocaleString({
    month: "numeric",
    day: "numeric",
    year: "numeric",
    hour: "numeric",
    minute: "numeric"
  });
}

export function checkArrayDifference(original: any[], current?: any[]): number {
  return current?.filter(o => original.find(ob => JSON.stringify(o) !== JSON.stringify(ob)))?.length || 0;
}


export function writeHtml(product: any, canvas: HTMLCanvasElement, eanOrSku: "ean" | "sku", showPrice?: boolean) {
  return `<html lang="it">
                <head>
                    <title>${ product.name }</title>
                    <style>
                        @page {
                            size: auto;
                            margin: 0;
                        }
                    </style>
                </head>
                <body onload="window.print()" onafterprint="window.close()">
                    <div style="font-family: Times New Roman, Times, serif; text-align: center">
                        <h4 style="margin-bottom: -20px;">${ product.name }</h4><br>
                        <div style="position: relative;">
                            <span style="font-size: 10px;">${ product[eanOrSku] }</span>
                        </div>
                        <img style="margin-top: -4px;margin-bottom: -4px;" alt src="${ canvas?.toDataURL() }"/><br>
                        ${ !!showPrice ? `
                            <span style="font-size: 12px">PREZZO DI VENDITA: € ${ ((product.sellingPrice * (100 + (product.vat || 22)) / 100) || 0).toFixed(2).replace(".", ",") }</span>
                         ` : "" }
                    </div>
                </body>
            </html>`;
}

export function generateRandomCode(): string {
  return Math.random().toString(36).substring(2, 7);
}

export function preventInvalidCharactersForNumericTextInput(event: KeyboardEvent, decimal?: boolean, negative?: boolean): void {
  let allowedKeys = [
    'Backspace', 'Delete', 'Tab', 'Escape', 'Enter',
    'ArrowLeft', 'ArrowRight', 'ArrowUp', 'ArrowDown'
  ];

  if (!!decimal) {
    allowedKeys = [ ...allowedKeys, '.', ',' ];
  }

  if (!!negative) {
    allowedKeys = [ ...allowedKeys, '-' ];
  }

  if ((event.key >= '0' && event.key <= '9') || allowedKeys.includes(event.key)) {
    return;
  }
  event.preventDefault();
}

export function getAttachmentsObjectList(attachments: string[]) {
  return attachments.map(url => {
    const arr = (url as string).split(".");
    return {
      value: url,
      type: arr[arr.length - 1],
      name: arr[arr.length - 2] + arr[arr.length - 1]
    };
  });
}

export function capitalizeFirstCharOfAString(str: string): string {
  return str.charAt(0).toUpperCase() + str.slice(1);
}


/**function for handling the Roles,
 * Already has a build-in filter for Roles.GOD,
 * If the currentUser doesn't have any roles it returns false,
 * You can choose if all the passed Roles needs to be required or only one of the Roles needs to be present using the 'required' flag
 *
 * @param currentUser PartialUser, usually the profileUser, used as where to check the roles
 * @param roles Entity of type Array<{ role: Roles, required?: boolean }>,
 * the first param is the role, self explicative,
 * the second param is the flag for having all the roles (with this param at true) in AND instead of OR
 */
export function hasRoles(currentUser: Partial<User>, roles: { role: Roles, required?: boolean }[]) {
  if (!currentUser.roles) {
    return false;
  }

  //check if user has god
  if (currentUser.roles.some(role => (role === Roles.GOD))) {
    return true;
  }

  return
  /*
    //check if the roles have at least one required
    if (roles.some(e => e.required)) {
      //check every role in the given roles for its existence in the user
      return roles.every(role => currentUser.roles!.some(currentUserRole => (currentUserRole.roleName === role.role && currentUserRole.isActive)));
    }

    //check if any role in the given roles exists in the user
    return roles.some(role => currentUser.roles!.some(currentUserRole => (currentUserRole.roleName === role.role && currentUserRole.isActive)));*/
}
