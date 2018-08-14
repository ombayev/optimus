import {
  Component,
  OnInit,
  OnDestroy,
  ViewEncapsulation,
  HostBinding
} from '@angular/core';

// rxjs
import { Subscription, Observable } from 'rxjs';
import { take, tap } from 'rxjs/operators';

// ngrx
import { Store, select } from '@ngrx/store';
import * as fromRoot from '../../../../store';
import * as fromOrders from '../../store';

// material
import { MatDialog } from '@angular/material';

// form component
import { OrdersFormComponent } from '../../forms';

// interfaces
import {
  OrdersSearchParams,
  OrderItem,
  OrderStatus
} from '../../../../shared/interface/orders.model';
import { PaginationState } from '../../store/reducers/pagination.reducer';
import { PeopleItem } from '../../../../shared/interface/people.model';

@Component({
  selector: 'app-orders.common-app-v2-container',
  encapsulation: ViewEncapsulation.None,
  template: `
    <app-orders-header
      fxFlex="65px" class="common-header"
      [appName]="appName" [searching]="searching"
      [accessLevel]="(user$ | async).Position?.AccessLevel"
      (openForm)="openForm('new', $event)"
      (toggleFilters)="toggleFilters()">
    </app-orders-header>

    <app-orders-list
      fxFlex class="common-content"
      [orders]="data" [orderStatuses]="orderStatuses$ | async"
      (openForm)="openForm('view', $event)">
    </app-orders-list>

    <app-orders-footer fxFlex="49px" class="common-footer"
      [pagination]="pagination" [top]="params.top" [searching]="searching"
      (onNext)="onNext()" (onBack)="onBack()">
    </app-orders-footer>

    <app-orders-filters class="common-filters-container"
      [style.display]="(showFilters ? 'flex' : 'none')"
      fxLayout="column" fxLayoutAlign="start start"
      (toggleFilters)="toggleFilters()">
    </app-orders-filters>
  `,
  styleUrls: ['./orders.component.scss']
})
export class OrdersComponent implements OnInit, OnDestroy {
  appName = 'Orders';

  user$: Observable<PeopleItem>;

  $data: Subscription;
  data: OrderItem[];

  $searching: Subscription;
  searching: boolean;

  $params: Subscription;
  params: OrdersSearchParams;

  $pagination: Subscription;
  pagination: PaginationState;

  orderStatuses$: Observable<OrderStatus[]>;

  // when showFilters toggle it toggles class in host element
  @HostBinding('class.filtersOpened')
  showFilters = false;

  constructor(
    private store_root: Store<fromRoot.RootState>,
    private store_orders: Store<fromOrders.OrdersState>,
    public form: MatDialog
  ) {}

  ngOnInit() {
    // update html page title and store.root.apps.name
    this.store_root.dispatch(new fromRoot.SetAppName(this.appName));

    // fetch OrderStatuses list from database
    this.store_root.dispatch(new fromOrders.FetchOrderStatuses());

    this.orderStatuses$ = this.store_orders.pipe(
      select(fromOrders.selectAllOrderStatuses)
    );

    this.user$ = this.store_root.pipe(select(fromRoot.getUserOptimus));

    // main data = array of orders
    this.$data = this.store_orders
      .pipe(select(fromOrders.selectAllOrders))
      .subscribe(data => {
        this.data = data;
      });

    this.$pagination = this.store_orders
      .pipe(select(fromOrders.getPagination))
      .subscribe(pagination => (this.pagination = pagination));

    this.$searching = this.store_orders
      .select(fromOrders.getOrdersSearching)
      .subscribe(search => {
        this.searching = search;
      });

    // monitor params for top
    this.$params = this.store_orders
      .select(fromOrders.getParams)
      .subscribe(params => {
        this.params = params;
      });
  }

  onNext() {
    this.store_orders.dispatch(
      new fromOrders.OnNext(
        this.pagination.links[this.pagination.currentIndex + 1]
      )
    );
  }

  onBack() {
    this.store_orders.dispatch(
      new fromOrders.OnBack(
        this.pagination.links[this.pagination.currentIndex - 1]
      )
    );
  }

  countTotalItems(params) {
    if (params) {
      this.store_orders.dispatch(new fromOrders.BeginCount(params));
    }
  }

  openForm(mode, item?): void {
    const data = { mode, item };
    console.log(data);
    const formRef = this.form.open(OrdersFormComponent, {
      data,
      disableClose: true,
      autoFocus: false
    });
    formRef
      .afterClosed()
      .pipe(take(1))
      .subscribe(res => {
        console.log(res);
      });
  }

  toggleFilters() {
    if (this.showFilters) {
      this.showFilters = false;
    } else {
      this.showFilters = true;
    }
  }

  ngOnDestroy() {
    this.$pagination.unsubscribe();
    this.$data.unsubscribe();
    this.$params.unsubscribe();
    this.$searching.unsubscribe();
  }
}
