import { Component, Input } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'qi-project-item',
  templateUrl: '/public/html/projects/project-item.html'
})

/**
 * The Projects List project item component
 *
 * @module projects
 * @class ProjectItemComponent
 */
export class ProjectItemComponent {
  @Input() project;
  
  constructor(private router: Router) { }
  
  /**
   * Opens the Collections List page for the given project.
   *
   * @method visitCollections
   * @param project {string} the project name to visit
   */
  visitCollections() {
    this.router.navigate(['/qiprofile', this.project.name]);
  }
}
