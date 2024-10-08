import { Injectable } from '@angular/core';
import { Grocery } from './grocery';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { tap, map, catchError, timeout } from 'rxjs/operators';
// Marking this service as injectable at the root level, making it available throughout the application
@Injectable({
  providedIn: 'root'
})
export class GroceryserviceService {
  // Local list to keep track of grocery items
  groceryList: Grocery[] = [];
    // Observable and Subject to notify when the grocery list changes
  groceryListChanged$!: Observable<boolean>;
  groceryListChangedSubject!: Subject<boolean>;
  // Observable and Subject to handle errors
  triggerError$!: Observable<boolean>;
  triggerErrorSubject!: Subject<boolean>;
  // URL of the backend server API for grocery operations
  url = "http://localhost:8080/api/Grocery";


    // Method to fetch the list of groceries from the server
  constructor(private http: HttpClient) {
    this.groceryListChangedSubject = new Subject<boolean>();
    this.groceryListChanged$ = this.groceryListChangedSubject.asObservable();

    this.triggerErrorSubject = new Subject<boolean>();
    this.triggerError$ = this.triggerErrorSubject.asObservable();
  }

    // HTTP GET request to fetch groceries
  getGroceryList(): Observable<Grocery[]> {
    console.log('Getting Grocery Info from OFF Server');
    console.log(this.url);


    return this.http.get(this.url).pipe(
      timeout(5000),
      map((data: any) => {
        console.log("Data from Server: ", data);
        return data.map((item: any) =>
          new Grocery(item._id, item.groceryname,
            item.groceryquantity,
            item.grocerycategory,
            item.groceryprice,
            item.groceryunit));
      }),
      catchError((e) => {
        console.error('Error getting grocery list gs: ', e);
        console.error(e);
        this.triggerErrorSubject.next(true);
        throw e;
      })
    );
  }



    // Method to add a new grocery item to the server
  addGrocery(grocery: Grocery): Observable<any> {
    console.log('Adding Grocery Item to Server');
    console.log(grocery);

    //create json post object
    let postObject = {
      groceryname: grocery.getName(),
      groceryquantity: grocery.getQuantity(),
      grocerycategory: grocery.getCategory(),
      groceryprice: grocery.getPrice(),
      groceryunit: grocery.getUnit()
    };

    return this.http.post(this.url, postObject).pipe(
      timeout(5000),
      tap({
        next: (data: any) => {
          console.log("ADD to OFF Server: ", data);
          this.groceryListChangedSubject.next(true);
        },
        error: (e) => {
          console.error(e);
          this.triggerErrorSubject.next(true);
        },
      })
    );
  }


  deleteGrocery(grocery: Grocery): Observable<any> {
    const _id = grocery._id;
    const url = `${this.url}/${_id}`;

    return this.http.delete(url).pipe(
      timeout(5000),
      tap({
        next: (data: any) => {
          console.log("Data deleted: ", data);
          this.groceryListChangedSubject.next(true);
        },
        error: (e) => {
          console.log("Error deleting grocery item: ", e);
          console.error(e);
          this.triggerErrorSubject.next(true);
        },
      })
    );

  }

  editGrocery(grocery: Grocery, index: number): Observable<any> {
    console.log('Adding Grocery Item to OFF Server');
    console.log(grocery);

    //create json post object
    let postObject = {
      _id: grocery._id,
      updates: {
        groceryname: grocery.getName(),
        groceryquantity: grocery.getQuantity(),
        grocerycategory: grocery.getCategory(),
        groceryprice: grocery.getPrice(),
        groceryunit: grocery.getUnit()
      }
    };

    return this.http.put(this.url, postObject).pipe(
      timeout(5000),
      tap({
        next: (data: any) => {
          console.log("UPDATE to Server: ", data);
          this.groceryList[index] = grocery;
          this.groceryListChangedSubject.next(true);
        },
        error: (e) => {
          console.error(e);
          this.triggerErrorSubject.next(true);
        },
      })
    );
  }

}
